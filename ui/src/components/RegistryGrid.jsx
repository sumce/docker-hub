import React, { useState } from 'react';
import './RegistryGrid.css';

const DEFAULT_REGISTRIES = [
  { name: 'docker.io',           label: 'Docker Hub',               icon: '🐳' },
  { name: 'ghcr.io',             label: 'GitHub Container Registry', icon: '🐙' },
  { name: 'quay.io',             label: 'Quay',                      icon: '🔵' },
  { name: 'gcr.io',              label: 'Google Container Registry',  icon: '☁️' },
  { name: 'k8s.gcr.io',          label: 'Kubernetes GCR',            icon: '☸️' },
  { name: 'registry.gitlab.com', label: 'GitLab Registry',           icon: '🦊' },
];

function RegistryCard({ name, label, icon, host }) {
  const [copied, setCopied] = useState(false);
  const cmd = `docker pull ${host}/library/nginx:latest?registry=${name}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(cmd);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = cmd;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="registry-card">
      <div className="registry-icon">{icon}</div>
      <div className="registry-info">
        <h3>{label}</h3>
        <code>{name}</code>
      </div>
      <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={copy}>
        {copied ? '✅ 已复制' : '📋 复制命令'}
      </button>
    </div>
  );
}

export default function RegistryGrid({ host, registries: activeRegistries }) {
  const list = activeRegistries
    ? DEFAULT_REGISTRIES.filter((r) => activeRegistries.includes(r.name))
    : DEFAULT_REGISTRIES;

  return (
    <section className="section">
      <h2 className="section-title">📡 支持的 Registry</h2>
      <div className="registry-grid">
        {list.map((r) => (
          <RegistryCard key={r.name} {...r} host={host} />
        ))}
      </div>
    </section>
  );
}
