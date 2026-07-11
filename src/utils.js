/**
 * 工具函数
 */

/**
 * 快速返回 JSON 响应
 */
export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

/**
 * 给响应附加 CORS 和代理标识头
 */
export function enrichHeaders(headers, cacheStatus) {
  headers.set('access-control-allow-origin', '*');
  headers.set('access-control-allow-methods', 'GET, HEAD, OPTIONS');
  headers.set('access-control-allow-headers', 'authorization, accept, content-type');
  headers.set('x-docker-proxy', 'cloudflare-worker');
  if (cacheStatus) headers.set('x-cache-status', cacheStatus);
  return headers;
}

/**
 * 安全地从 URL 路径中提取镜像名（防止 /../ 等注入）
 */
export function extractImageName(path) {
  // 去掉 /v2/ 前缀
  const parts = path.replace(/^\/v2\//, '').split('/');
  const image = [];
  for (const p of parts) {
    if (p === 'blobs' || p === 'manifests') break;
    if (p === '..' || p === '.' || p === '') continue; // 安全过滤
    image.push(p);
  }
  return image.join('/');
}

/**
 * 从路径判断是否通过 digest（摘要）引用
 */
export function isDigestRef(path) {
  return path.includes('sha256:') || path.includes('sha512:');
}
