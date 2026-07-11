import React from 'react';
import './Hero.css';

export default function Hero({ host }) {
  return (
    <section className="hero">
      <h1 className="hero-title">Docker Pull，快人一步</h1>
      <p className="hero-subtitle">
        基于 Cloudflare Workers 的边缘代理，缓存加速 Docker 镜像拉取，
        支持多 Registry 源切换。配置一次，全局生效。
      </p>
    </section>
  );
}
