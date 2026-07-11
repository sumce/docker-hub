/**
 * 展示页面
 *
 * React 前端构建产物由 wrangler.toml 的 assets 配置自动托管，
 * Worker 只需提供数据端点。
 */

import { REGISTRIES, DEFAULT_REGISTRY } from './config.js';

/**
 * 健康检查 JSON 端点（React 前端也通过此接口获取运行时状态）
 */
export function renderHealth() {
  return new Response(JSON.stringify({
    status: 'ok',
    service: 'docker-registry-proxy',
    version: '1.0.0',
    registries: Object.keys(REGISTRIES),
    defaultRegistry: DEFAULT_REGISTRY,
    uptime: Date.now(),
  }), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-cache',
    },
  });
}
