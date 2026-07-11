# Docker Hub 镜像代理 · Cloudflare Worker

用一个 Cloudflare Worker 同时完成两件事：

1. **Docker Hub 镜像加速**：按 Docker Registry v2 协议代理 `docker pull`，加速国内拉取。
2. **Next.js 落地页**：用 Next.js + Tailwind + shadcn/ui 做的说明页面，自动展示你自己的加速域名和使用命令。

前端以 Next.js **静态导出**（`output: 'export'`）打包到 `out/`，由 Worker 的静态资源托管，Worker 专注处理 `/v2/` 代理。

```
浏览器访问  /            ->  Next.js 落地页（静态资源 out/）
docker 拉取  /v2/...     ->  Worker 代理到 registry-1.docker.io
```

## 目录结构

```
docker-hub/
├── worker/
│   ├── index.ts        # Worker 代理核心逻辑（Registry v2）
│   └── tsconfig.json
├── app/                # Next.js App Router 前端落地页
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/             # shadcn/ui 组件 (button/card/badge/tabs)
│   └── code-block.tsx  # 可复制代码块
├── lib/utils.ts        # cn() 工具
├── public/favicon.svg
├── next.config.mjs     # 静态导出配置
├── tailwind.config.ts
├── components.json     # shadcn 配置
├── wrangler.jsonc      # Worker 配置（入口 + 静态资源绑定 out/ + 环境变量）
├── tsconfig.json
└── package.json
```

## 本地开发

```bash
npm install

# 调试前端页面（Next.js 热更新，http://localhost:3000）
npm run dev

# 同时调试 Worker + 前端（先静态导出再用 wrangler 本地运行）
npm run start
```

## 部署到 Cloudflare

```bash
# 首次需登录
npx wrangler login

# 构建前端 + 部署 Worker
npm run deploy
```

部署后会得到一个 `https://docker-hub-proxy.<你的子域>.workers.dev` 地址，
或在 Cloudflare 后台为该 Worker 绑定自定义域名（推荐，`workers.dev` 域名在部分网络下可能不通）。

## 怎么用

假设你的加速域名是 `hub.example.com`。

### 方式一：配置为镜像加速器（推荐）

编辑 `/etc/docker/daemon.json`（Windows/Mac 在 Docker Desktop → Settings → Docker Engine）：

```json
{
  "registry-mirrors": ["https://hub.example.com"]
}
```

重启 Docker 后，`docker pull nginx` 会自动走加速。

```bash
sudo systemctl daemon-reload
sudo systemctl restart docker
```

### 方式二：直接加前缀拉取

```bash
docker pull hub.example.com/library/nginx:latest
docker tag  hub.example.com/library/nginx:latest nginx:latest
```

> 官方镜像（nginx、redis 等）需带 `library/` 前缀，代理会自动补全并 301 重定向。

## 换成其它 Registry

在 `wrangler.jsonc` 的 `vars` 里改上游即可（例如 GHCR、Quay、K8s）：

```jsonc
"vars": {
  "UPSTREAM": "https://ghcr.io",
  "AUTH_URL": "https://ghcr.io/token"
}
```

## 工作原理

Docker 拉取镜像走的是「令牌鉴权」流程，代理的关键就是把鉴权地址改写回自己：

1. 客户端访问 `/v2/`，上游返回 `401 + Www-Authenticate`，指明去哪换 token。
2. Worker 把该头改写成指向本站 `/v2/auth`，让客户端回来找我们要 token。
3. 客户端带 `scope` 请求 `/v2/auth`，Worker 代它去上游真正的鉴权服务换 token 返回。
4. 客户端带 token 请求 manifests / blobs，Worker 透明转发到上游。

## 说明

- 仅代理公开镜像，请遵守 Docker Hub 使用条款与速率限制。
- Worker 免费额度为每天 10 万次请求，个人使用通常足够。
