import React, { useState } from 'react';
import './QuickStart.css';

function CopyBtn({ command, label = '📋 复制' }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = command;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={copy}>
      {copied ? '✅ 已复制' : label}
    </button>
  );
}

function CodeBlock({ code, label }) {
  return (
    <div className="code-block">
      <code>{code}</code>
      <CopyBtn command={code} />
    </div>
  );
}

export default function QuickStart({ host }) {
  return (
    <section className="section">
      <h2 className="section-title">⚡ 快速开始</h2>

      <CodeBlock code={`docker pull ${host}/library/nginx:latest`} />

      <CodeBlock code={`docker pull ${host}/library/nginx:latest?registry=ghcr.io`} />

      <details className="daemon-hint">
        <summary>🔧 配置 Docker Daemon 永久生效</summary>
        <div style={{ marginTop: '0.75rem' }}>
          <CodeBlock
            code={`echo '{"registry-mirrors":["https://${host}"]}' > /etc/docker/daemon.json`}
            label="📋 复制"
          />
          <CodeBlock code={`systemctl restart docker`} />
        </div>
      </details>
    </section>
  );
}
