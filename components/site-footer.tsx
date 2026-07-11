import { Github } from "lucide-react";

const columns = [
  {
    title: "产品",
    links: [
      { label: "使用方式", href: "#usage" },
      { label: "核心特性", href: "#features" },
      { label: "工作原理", href: "#how-it-works" },
    ],
  },
  {
    title: "资源",
    links: [
      { label: "源码仓库", href: "https://github.com/sumce/docker-hub" },
      { label: "Docker Docs", href: "https://docs.docker.com" },
      { label: "Cloudflare Workers", href: "https://workers.cloudflare.com" },
    ],
  },
  {
    title: "换上游",
    links: [
      { label: "GitHub Container Registry", href: "https://ghcr.io" },
      { label: "Quay.io", href: "https://quay.io" },
      { label: "registry.k8s.io", href: "https://registry.k8s.io" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <div className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo/unsiao_b.svg"
                alt="UNSIAO"
                className="h-7 w-auto [filter:invert(1)]"
              />
              <span className="text-base font-semibold tracking-tight">
                UNSIAO™
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              基于 Cloudflare Worker 的 Docker Registry 代理，
              为国内镜像拉取提供全球边缘加速。
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-medium text-foreground">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel="noreferrer"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>仅代理公开镜像，请遵守 Docker Hub 使用条款与速率限制。</p>
          <a
            href="https://github.com/sumce/docker-hub"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            <Github className="h-4 w-4" />
            sumce/docker-hub
          </a>
        </div>
      </div>
    </footer>
  );
}
