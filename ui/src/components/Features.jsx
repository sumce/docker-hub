import React from 'react';
import './Features.css';

const FEATURES = [
  {
    icon: '🚀',
    title: '边缘缓存加速',
    desc: '镜像层缓存 30 天，全球边缘节点就近分发，大幅减少拉取耗时。',
  },
  {
    icon: '🔐',
    title: '自动 Token 认证',
    desc: '自动处理 Docker Hub 的 Bearer Token 流程，客户端无需额外配置。',
  },
  {
    icon: '🔄',
    title: '多 Registry 切换',
    desc: '通过查询参数 ?registry=xxx 一键切换源，支持 6+ 主流 Registry。',
  },
  {
    icon: '📊',
    title: '零运维',
    desc: 'Cloudflare Workers 托管，无需维护服务器，Git Push 即可部署更新。',
  },
];

export default function Features() {
  return (
    <section className="section">
      <h2 className="section-title">✨ 核心特性</h2>
      <div className="feature-grid">
        {FEATURES.map((f, i) => (
          <div className="feature-card" key={i}>
            <div className="feature-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
