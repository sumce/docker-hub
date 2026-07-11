/**
 * Docker Registry Proxy — 入口路由
 *
 * 请求分发：
 *   / 或 /index.html  → 由 static assets 托管（React 前端）
 *   /health           → 健康检查 JSON
 *   /v2/...           → Docker Registry 代理
 *
 * 模块结构：
 *   src/
 *     index.js   ← 你在这里
 *     config.js     配置（Registry 列表、缓存 TTL）
 *     proxy.js      代理转发（上游请求、Token 认证、重定向）
 *     auth.js       Docker Hub Bearer Token 获取
 *     cache.js      缓存策略（Cache API）
 *     pages.js      健康检查端点
 *     utils.js      工具函数
 *   ui/              React 前端（Vite 构建）
 */

import { REGISTRY_ALIASES, DEFAULT_REGISTRY } from './config.js';
import { handleProxy } from './proxy.js';
import { renderHealth } from './pages.js';
import { jsonResponse } from './utils.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // ── 路由表 ───────────────────────────────────────────

      // 健康检查 / 状态查询
      if (path === '/health' || path === '/status') {
        return renderHealth();
      }

      // Docker Registry API 代理
      if (path.startsWith('/v2/')) {
        const registryName = resolveRegistry(url, request);
        return await handleProxy(request, registryName, ctx);
      }

      // robots.txt
      if (path === '/robots.txt') {
        return new Response('User-agent: *\nDisallow: /v2/', {
          headers: { 'content-type': 'text/plain' },
        });
      }

      // 其他路径（/、/index.html、/assets/*）由 static assets 托管，
      // Worker 不需要处理。但如果 assets 未配置，给个提示。
      if (path === '/' || path === '/index.html') {
        return new Response(
          '<html><body style="background:#0b0e14;color:#e2e8f0;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh"><div style="text-align:center"><h1>📦 Docker Registry Proxy</h1><p style="color:#94a3b8">Proxy is running. Build the React UI with <code style="background:#1e293b;padding:2px 6px;border-radius:4px">cd ui && npm run build</code></p></div></body></html>',
          { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } }
        );
      }

      // 未匹配
      return jsonResponse({ error: 'Not Found', path }, 404);

    } catch (err) {
      console.error('Unhandled error:', err);
      return jsonResponse({ error: 'Internal Server Error' }, 500);
    }
  },
};

/**
 * 解析目标 Registry 名称
 *
 * 优先级：
 *   1. URL 查询参数 ?registry=docker.io
 *   2. Host 头匹配（如 docker.example.com → docker.io）
 *   3. 默认 docker.io
 */
function resolveRegistry(url, request) {
  // 查询参数
  const queryReg = url.searchParams.get('registry');
  if (queryReg && REGISTRY_ALIASES.includes(queryReg)) return queryReg;

  // Host 头匹配
  const host = request.headers.get('host') || '';
  for (const name of REGISTRY_ALIASES) {
    if (host === name || host.startsWith(name + '.')) return name;
  }

  return DEFAULT_REGISTRY;
}
