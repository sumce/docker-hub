# 📦 Docker Registry Proxy

基于 **Cloudflare Workers** 的 Docker 镜像拉取加速代理。

> 替换 `docker pull` 中的 Registry 地址，即可享受边缘缓存加速，无需任何客户端安装。

---

## 项目结构

```
docker-registry-proxy/
├── src/
│   ├── index.js      # 入口路由 — 请求分发
│   ├── config.js     # 配置中心 — Registry 列表 / 缓存 TTL
│   ├── proxy.js      # 代理核心 — 转发 / Token 认证 / 重定向
│   ├── auth.js       # Docker Hub Bearer Token 获取
│   ├── cache.js      # 缓存策略 — Cache API 读写
│   ├── pages.js      # 展示页面 — 首页 HTML / 健康检查
│   └── utils.js      # 工具函数
├── package.json
├── wrangler.toml     # Cloudflare Workers 配置
└── README.md
```

**设计原则**：每个文件职责单一，方便阅读理解也方便协作 PR。

---

## 快速部署

### 1. 安装 wrangler

```bash
npm install -g wrangler
wrangler login
```

### 2. 修改配置

编辑 `wrangler.toml`，取消注释并填入你的域名：

```toml
[route]
pattern = "docker.你的域名.com/*"
zone_id = "你的 Zone ID"
```

### 3. 部署

```bash
npm run deploy
# 或
wrangler deploy src/index.js
```

### 4. 测试

```bash
# 访问首页
curl https://docker.你的域名.com/

# 拉取镜像
docker pull docker.你的域名.com/library/nginx:latest
```

---

## 使用方法

### 按需使用 — 替换域名

```bash
# Docker Hub（默认）
docker pull docker.你的域名.com/library/nginx:latest

# GitHub Container Registry
docker pull docker.你的域名.com/owner/repo:tag?registry=ghcr.io

# Quay
docker pull docker.你的域名.com/prometheus/prometheus:latest?registry=quay.io
```

### 永久配置 — Docker Daemon

```json
{
  "registry-mirrors": ["https://docker.你的域名.com"]
}
```

```bash
systemctl restart docker
```

之后 `docker pull nginx` 自动走代理。

---

## 支持的 Registry

| Registry | 标识名 | 用途 |
|---|---|---|
| Docker Hub | `docker.io` (默认) | 公共镜像市场 |
| GitHub Container Registry | `ghcr.io` | GitHub 发布镜像 |
| Quay | `quay.io` | CoreOS / Prometheus 等 |
| Google Container Registry | `gcr.io` | Google 服务镜像 |
| Kubernetes GCR | `k8s.gcr.io` | K8s 组件镜像 |
| GitLab Registry | `registry.gitlab.com` | GitLab CI 镜像 |

更多 Registry 可在 `src/config.js` 的 `REGISTRIES` 中扩展。

---

## 技术要点

| 特性 | 实现 |
|---|---|
| **Token 认证** | 自动处理 Docker Hub 401 → Bearer Token 流程 |
| **缓存加速** | Blob 缓存 30 天 / Manifest 按摘要缓存 1 天 / 按标签缓存 5 分钟 |
| **重定向跟随** | Blob 的 302 到 S3/CDN 自动跟随 |
| **CORS** | 全开 `access-control-allow-origin: *` |
| **私有镜像** | 透传 `Authorization` 头，支持私有仓库 |
| **安全** | `..` 过滤防止路径穿越 |

---

## 本地开发

```bash
# 安装依赖
npm install

# 本地启动（需 Docker）
wrangler dev src/index.js

# 查看日志
npm run tail
```

---

## 从 GitHub 同步到 Workers

本项目支持两种更新方式：

1. **wrangler deploy**（推荐）：本地 push 后执行部署
2. **Cloudflare Dashboard 直连 GitHub**：在 Workers Dashboard 中关联本仓库，自动部署

---

## License

MIT
