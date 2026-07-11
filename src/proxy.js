/**
 * Registry 代理核心
 *
 * 职责：
 * - 解析目标 registry（docker.io / ghcr.io / quay.io …）
 * - 构造上游请求 URL 和请求头
 * - 处理 302 重定向（blob 下载）
 * - 组装最终响应
 */

import { REGISTRIES, DEFAULT_REGISTRY, ACCEPT_MANIFEST, USER_AGENT } from './config.js';
import { obtainToken } from './auth.js';
import { isCacheable, buildCacheKey, lookupCache, storeCache } from './cache.js';
import { jsonResponse, enrichHeaders } from './utils.js';

/**
 * 路由入口：处理 /v2/ 路径的代理请求
 *
 * @param {Request} request
 * @param {object} registryName - 已解析的 registry 名
 * @param {object} ctx - Worker 上下文（用于 waitUntil）
 * @returns {Promise<Response>}
 */
export async function handleProxy(request, registryName, ctx) {
  const url = new URL(request.url);
  const path = url.pathname;
  const registry = REGISTRIES[registryName];
  if (!registry) {
    return jsonResponse({ error: `registry '${registryName}' not supported` }, 400);
  }

  // ----- 1. 构造上游 URL -----
  const upstreamUrl = buildUpstreamUrl(url, registry.host);

  // ----- 2. 准备请求头 -----
  const upstreamHeaders = buildHeaders(request);

  // ----- 3. Cache 查询 -----
  const cacheKey = isCacheable(path, request.method) ? buildCacheKey(request, registryName) : null;
  if (cacheKey) {
    const cached = await lookupCache(cacheKey);
    if (cached) return cached;
  }

  // ----- 4. 发往上游 -----
  let response = await fetch(upstreamUrl, {
    method: request.method,
    headers: upstreamHeaders,
    redirect: 'manual',
  });

  // ----- 5. 401 → Token 认证重试 -----
  if (response.status === 401 && registry.authHost) {
    const wwwAuth = response.headers.get('www-authenticate') || '';
    const token = await obtainToken(wwwAuth, url, registry);
    if (token) {
      upstreamHeaders.set('authorization', `Bearer ${token}`);
      response = await fetch(upstreamUrl, {
        method: request.method,
        headers: upstreamHeaders,
        redirect: 'manual',
      });
    }
  }

  // ----- 6. 3xx → 跟随重定向（blob 走 S3/CDN） -----
  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get('location');
    if (location) {
      response = await fetch(location, {
        method: 'GET',
        headers: { 'user-agent': USER_AGENT },
        redirect: 'follow',
      });
    }
  }

  // ----- 7. 写入缓存 -----
  if (response.ok && cacheKey) {
    ctx.waitUntil(storeCache(cacheKey, response.clone(), path));
  }

  // ----- 8. 返回 -----
  return buildResponse(response, path, !!cacheKey);
}

// ---- 内部函数 ----

function buildUpstreamUrl(url, host) {
  const u = new URL(url);
  u.hostname = host;
  u.protocol = 'https';
  u.port = '';
  u.search = '';
  return u.toString();
}

function buildHeaders(request) {
  const headers = new Headers();

  for (const key of ['accept', 'content-type', 'content-length', 'user-agent', 'authorization']) {
    const val = request.headers.get(key);
    if (val) headers.set(key, val);
  }

  if (!headers.has('accept')) headers.set('accept', ACCEPT_MANIFEST);
  if (!headers.has('user-agent')) headers.set('user-agent', USER_AGENT);

  return headers;
}

function buildResponse(upstreamResponse, path, isCacheablePath) {
  const headers = new Headers(upstreamResponse.headers);

  const cacheStatus = headers.get('x-cache-status') ||
    (isCacheablePath ? 'MISS' : 'BYPASS');

  enrichHeaders(headers, cacheStatus);

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers,
  });
}
