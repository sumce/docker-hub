/**
 * Docker Registry Token 认证
 *
 * Docker Hub 使用 Bearer Token 认证方案：
 *   1. 首次请求 Registry → 返回 401 + WWW-Authenticate 头
 *   2. 从中提取 realm/service/scope
 *   3. 请求 auth.docker.io/token 获取 token
 *   4. 用 Bearer token 重试原请求
 */

import { extractImageName } from './utils.js';

/**
 * 解析 WWW-Authenticate 头并获取 Token
 *
 * @param {string} wwwAuth - 401 响应中的 WWW-Authenticate 头
 * @param {URL} originalUrl - 用户请求的原始 URL
 * @param {object} registry - 当前 registry 配置
 * @returns {Promise<string|null>}
 */
export async function obtainToken(wwwAuth, originalUrl, registry) {
  try {
    const params = parseWwwAuthenticate(wwwAuth);
    const realm   = params.realm || `https://${registry.authHost}${registry.authPath}`;
    const service = params.service || registry.authService;
    const scope   = params.scope || buildScope(originalUrl.pathname);

    const tokenUrl = new URL(realm);
    if (service) tokenUrl.searchParams.set('service', service);
    if (scope)   tokenUrl.searchParams.set('scope', scope);

    const resp = await fetch(tokenUrl.toString(), {
      headers: { 'user-agent': 'DockerRegistryProxy/1.0' },
    });
    if (!resp.ok) {
      console.error(`Token endpoint returned ${resp.status} for ${realm}`);
      return null;
    }

    const data = await resp.json();
    return data.token || data.access_token || null;
  } catch (e) {
    console.error('Token acquisition failed:', e);
    return null;
  }
}

/**
 * 解析 WWW-Authenticate 值
 *
 * 输入: Bearer realm="https://auth.docker.io/token",service="registry.docker.io",scope="repository:library/nginx:pull"
 * 输出: { realm: "https://auth.docker.io/token", service: "registry.docker.io", scope: "repository:library/nginx:pull" }
 */
function parseWwwAuthenticate(header) {
  const params = {};
  // 去掉前面的 "Bearer " 或 "Basic " 前缀
  const content = header.replace(/^\w+\s+/, '').trim();
  const re = /(\w+)\s*=\s*"((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    params[m[1]] = m[2];
  }
  return params;
}

/**
 * 从请求路径构建 scope
 * /v2/library/nginx/manifests/latest → repository:library/nginx:pull
 */
function buildScope(path) {
  const name = extractImageName(path);
  return name ? `repository:${name}:pull` : '';
}
