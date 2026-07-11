import { useMemo, useState } from "react";

/** 可复制的代码块 */
function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* 剪贴板不可用时忽略 */
    }
  };

  return (
    <div className="code">
      <pre>
        <code>{code}</code>
      </pre>
      <button className="copy" onClick={copy} aria-label="复制">
        {copied ? "已复制 ✓" : "复制"}
      </button>
    </div>
  );
}

function App() {
  // 运行时读取当前访问域名，命令里直接展示用户自己的地址
  const host = useMemo(() => {
    if (typeof window === "undefined") return "your-worker.workers.dev";
    return window.location.host;
  }, []);

  const daemonJson = `{
  "registry-mirrors": ["https://${host}"]
}`;

  const pullCmd = `docker pull ${host}/library/nginx:latest`;
  const pullCmd2 = `# 拉取后可重打 tag 方便使用
docker tag ${host}/library/nginx:latest nginx:latest`;

  return (
    <div className="page">
      <header className="hero">
        <div className="logo">🐳</div>
        <h1>Docker Hub 镜像加速</h1>
        <p className="subtitle">
          基于 Cloudflare Worker 的 Docker Registry 代理，加速国内镜像拉取。
        </p>
        <div className="endpoint">
          <span className="dot" /> 加速地址：<strong>{host}</strong>
        </div>
      </header>

      <main className="content">
        <section className="card">
          <h2>方式一 · 配置为镜像加速器（推荐）</h2>
          <p>
            编辑 Docker 配置文件 <code>/etc/docker/daemon.json</code>
            （Windows/Mac 在 Docker Desktop → Settings → Docker Engine），加入：
          </p>
          <CodeBlock code={daemonJson} />
          <p>随后重启 Docker，之后 <code>docker pull nginx</code> 会自动走加速。</p>
          <CodeBlock code={"sudo systemctl daemon-reload\nsudo systemctl restart docker"} />
        </section>

        <section className="card">
          <h2>方式二 · 直接指定前缀拉取</h2>
          <p>不改配置，临时在镜像名前加上加速域名即可：</p>
          <CodeBlock code={pullCmd} />
          <CodeBlock code={pullCmd2} />
          <p className="hint">
            官方镜像（如 nginx、redis）需带 <code>library/</code> 前缀，
            代理会自动补全并重定向。
          </p>
        </section>

        <section className="card">
          <h2>它是怎么工作的？</h2>
          <ul className="steps">
            <li>
              <strong>/v2/</strong> 开头的请求由 Worker 按 Registry v2 协议代理到 Docker Hub。
            </li>
            <li>
              自动改写令牌鉴权地址，代客户端向上游换取 token。
            </li>
            <li>其余请求返回这个 React 页面。</li>
            <li>全球边缘节点转发，无需自建服务器。</li>
          </ul>
        </section>
      </main>

      <footer className="footer">
        <span>Powered by Cloudflare Workers</span>
        <span className="sep">·</span>
        <span>仅代理公开镜像，请遵守 Docker Hub 使用条款</span>
      </footer>
    </div>
  );
}

export default App;
