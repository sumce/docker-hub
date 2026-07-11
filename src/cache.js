/**
 * 缓存层
 *
 * 策略：
 * - blob（镜像层）→ 缓存 30 天，层内容不可变
 * - 通过 digest 拉取的 manifest → 缓存 1 天
 * - 通过 tag（如 latest）拉取的 manifest → 缓存 5 分钟
 *
 * 使用 Cloudflare Cache API，数据存储在边缘节点。
 */

import { CACHE_TTL, REGISTRIES } from './config.js';
import { isDigestRef } from './utils.js';

/**
 * 判断请求是否可缓存
 */
export function isCacheable(path, method) {
  if (method !== 'GET' && method !== 'HEAD') return false;
  return path.includes('/blobs/') || path.includes('/manifests/');
}

/**
 * 构造缓存键
 *
 * 不同 registry 的相同路径不应混用，将 registry 名编码到缓存键里。
 */
export function buildCacheKey(request, registryName) {
  const url = new URL(request.url);
  // 用查询参数做命名空间，不影响 URL 主体
  url.searchParams.set('_registry', registryName);

  const headers = new Headers();
  // Accept 头影响 manifest 的媒体类型，必须纳入缓存键
  const accept = request.headers.get('accept');
  if (accept) headers.set('accept', accept);

  return new Request(url.toString(), { method: 'GET', headers });
}

/**
 * 从缓存查询
 *
 * @param {Request} cacheKey
 * @returns {Promise<Response|null>} 缓存命中时返回响应，否则 null
 */
export async function lookupCache(cacheKey) {
  const cache = caches.default;
  const hit = await cache.match(cacheKey);
  if (hit) {
    const resp = new Response(hit.body, hit);
    resp.headers.set('x-cache-status', 'HIT');
    return resp;
  }
  return null;
}

/**
 * 写入缓存
 *
 * @param {Request} cacheKey
 * @param {Response} response - 注意：调用方应传递 clone()
 * @param {string} path - 请求路径，用于确定 TTL
 */
export async function storeCache(cacheKey, response, path) {
  try {
    let ttl;
    if (path.includes('/blobs/')) {
      ttl = CACHE_TTL.blob;
    } else if (isDigestRef(path)) {
      ttl = CACHE_TTL.digestManifest;
    } else {
      ttl = CACHE_TTL.tagManifest;
    }

    // Cloudflare Edge Cache 的生存时间由 Cache-Control 控制
    response.headers.set('cache-control', `public, max-age=${ttl}, s-maxage=${ttl}`);

    const cache = caches.default;
    await cache.put(cacheKey, response);
  } catch (e) {
    // 缓存写失败不影响主请求，仅记录
    console.error('Cache write error:', e);
  }
}
