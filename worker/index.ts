/**
 * Cloudflare Worker —— Docker Hub 镜像代理 (Registry v2 proxy)
 *
 * 工作方式：
 *  - 以 /v2/ 开头的请求 => 按 Docker Registry v2 协议代理到上游 (默认 Docker Hub)
 *  - 其它请求          => 交给静态资源 (React 前端落地页)
 *
 * Docker 拉取镜像的关键在于「令牌鉴权」：
 *  1. 客户端先访问 /v2/，上游返回 401 + Www-Authenticate 头，告诉客户端去哪里换 token。
 *  2. 我们把这个头改写成指向「本 Worker 的 /v2/auth」，让客户端回来找我们要 token。
 *  3. 客户端带着 scope 来 /v2/auth，我们再去上游真正的鉴权服务换 token 返回。
 *  4. 客户端带着 token 访问 manifests / blobs，我们透明转发到上游。
 */

export interface Env {
  ASSETS: Fetcher;
  UPSTREAM: string; // 上游 registry，如 https://registry-1.docker.io
  AUTH_URL: string; // 上游令牌服务，如 https://auth.docker.io/token
}

interface WwwAuthenticate {
  realm: string;
  service: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // 非 Registry 请求 -> 返回前端页面
    if (!url.pathname.startsWith("/v2")) {
      return env.ASSETS.fetch(request);
    }

    const upstream = env.UPSTREAM || "https://registry-1.docker.io";

    // 1) /v2/ 探测端点：转发；若上游要求鉴权，改写 401 头指回本站
    if (url.pathname === "/v2/" || url.pathname === "/v2") {
      const resp = await fetch(new URL("/v2/", upstream).toString(), {
        method: "GET",
        headers: request.headers,
        redirect: "follow",
      });
      if (resp.status === 401) {
        return unauthorized(url);
      }
      return resp;
    }

    // 2) 令牌端点：客户端拿着 scope 回来换 token，我们代其向上游鉴权服务索取
    if (url.pathname === "/v2/auth") {
      const probe = await fetch(new URL("/v2/", upstream).toString(), {
        method: "GET",
      });
      if (probe.status !== 401) {
        return probe;
      }
      const authenticateStr = probe.headers.get("WWW-Authenticate");
      if (authenticateStr === null) {
        return probe;
      }
      const wwwAuthenticate = parseAuthenticate(authenticateStr);

      let scope = url.searchParams.get("scope");
      // 官方镜像补全 library 前缀：repository:busybox:pull -> repository:library/busybox:pull
      if (scope && isDockerHub(upstream)) {
        const parts = scope.split(":");
        if (parts.length === 3 && !parts[1].includes("/")) {
          parts[1] = "library/" + parts[1];
          scope = parts.join(":");
        }
      }

      return fetchToken(
        env.AUTH_URL || wwwAuthenticate.realm,
        wwwAuthenticate.service,
        scope,
        request.headers.get("Authorization"),
      );
    }

    // 3) 官方镜像路径补全：/v2/busybox/manifests/latest -> /v2/library/busybox/manifests/latest
    if (isDockerHub(upstream)) {
      const parts = url.pathname.split("/");
      // ["", "v2", "<name>", "manifests|blobs|...", "<ref>"]
      if (parts.length === 5) {
        parts.splice(2, 0, "library");
        const redirect = new URL(url);
        redirect.pathname = parts.join("/");
        return Response.redirect(redirect.toString(), 301);
      }
    }

    // 4) 透明代理 manifests / blobs 等真实请求
    const targetUrl = new URL(url.pathname + url.search, upstream);
    const proxied = await fetch(
      new Request(targetUrl.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.body,
        redirect: "follow",
      }),
    );

    if (proxied.status === 401) {
      return unauthorized(url);
    }
    return proxied;
  },
} satisfies ExportedHandler<Env>;

function isDockerHub(upstream: string): boolean {
  return upstream.includes("registry-1.docker.io") || upstream.includes("docker.io");
}

/**
 * 解析 Www-Authenticate 头，例如：
 * Bearer realm="https://auth.docker.io/token",service="registry.docker.io"
 */
function parseAuthenticate(authenticateStr: string): WwwAuthenticate {
  // 抓取每个 key="value" 里的 value
  const re = /(?<==")(?:\\.|[^"\\])*(?=")/g;
  const matches = authenticateStr.match(re);
  if (matches == null || matches.length < 2) {
    throw new Error(`invalid Www-Authenticate Header: ${authenticateStr}`);
  }
  return { realm: matches[0], service: matches[1] };
}

/** 向上游令牌服务换取 token */
async function fetchToken(
  realm: string,
  service: string,
  scope: string | null,
  authorization: string | null,
): Promise<Response> {
  const url = new URL(realm);
  if (service) {
    url.searchParams.set("service", service);
  }
  if (scope) {
    url.searchParams.set("scope", scope);
  }
  const headers = new Headers();
  if (authorization) {
    headers.set("Authorization", authorization);
  }
  return fetch(url.toString(), { method: "GET", headers });
}

/** 返回 401，并把鉴权地址改写为本站的 /v2/auth */
function unauthorized(url: URL): Response {
  const headers = new Headers();
  headers.set(
    "Www-Authenticate",
    `Bearer realm="https://${url.hostname}/v2/auth",service="cloudflare-docker-proxy"`,
  );
  return new Response(JSON.stringify({ message: "UNAUTHORIZED" }), {
    status: 401,
    headers,
  });
}
