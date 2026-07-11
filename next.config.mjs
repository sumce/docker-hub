/** @type {import('next').NextConfig} */
const nextConfig = {
  // 静态导出：产出纯静态站点到 out/，交给 Cloudflare Worker 的静态资源托管。
  // 这样 Worker 仍可专注处理 /v2/ 的 Docker 代理逻辑。
  output: "export",
  images: {
    unoptimized: true,
  },
  // 生成 /path/index.html，配合静态托管更稳
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
