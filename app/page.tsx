"use client";

import * as React from "react";
import {
  ArrowRight,
  Github,
  Globe,
  KeyRound,
  Server,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeBlock } from "@/components/code-block";
import { Terminal } from "@/components/terminal";
import { ParticleLoader } from "@/components/particle-loader";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { cn } from "@/lib/utils";

export default function Home() {
  const [host, setHost] = React.useState("your-worker.workers.dev");
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") setHost(window.location.host);
  }, []);

  const daemonJson = `{
  "registry-mirrors": ["https://${host}"]
}`;
  const restartCmd = `sudo systemctl daemon-reload
sudo systemctl restart docker`;
  const pullCmd = `docker pull ${host}/library/nginx:latest
docker tag  ${host}/library/nginx:latest nginx:latest`;

  const features = [
    {
      icon: Globe,
      title: "全球边缘加速",
      desc: "复用 Cloudflare 遍布全球的边缘网络就近转发，无需自建服务器与带宽。",
    },
    {
      icon: KeyRound,
      title: "自动令牌鉴权",
      desc: "透明改写 Registry v2 的 Bearer 鉴权流程，docker pull 全程无感知。",
    },
    {
      icon: Zap,
      title: "零成本运行",
      desc: "每天 10 万次请求的免费额度，个人与小团队使用绰绰有余。",
    },
    {
      icon: Server,
      title: "任意上游可切",
      desc: "改一个环境变量即可代理 GHCR、Quay、registry.k8s.io 等镜像源。",
    },
  ];

  const steps = [
    { k: "01", t: "探测", d: "客户端访问 /v2/，上游返回 401 并告知去哪换 token。" },
    { k: "02", t: "改写", d: "Worker 把鉴权地址改写为本站 /v2/auth。" },
    { k: "03", t: "换票", d: "客户端带 scope 回来，Worker 代它向上游换取 token。" },
    { k: "04", t: "转发", d: "客户端带 token 拉取 manifests / blobs，透明转发到上游。" },
  ];

  return (
    <>
      <ParticleLoader onDone={() => setReady(true)} />

      <div
        className={cn(
          "transition-opacity duration-700",
          ready ? "opacity-100" : "opacity-0",
        )}
      >
        <SiteNav />

        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/60">
          <div className="pointer-events-none absolute inset-0 bg-grid" />
          <div className="pointer-events-none absolute inset-0 hero-glow" />
          <div className="relative mx-auto max-w-3xl px-5 pb-20 pt-24 text-center">
            <a
              href="https://github.com/sumce/docker-hub"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-secondary/40 px-3.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-border hover:text-foreground"
            >
              <span className="flex h-1.5 w-1.5 rounded-full bg-green-500" />
              开源 · Cloudflare Worker 驱动
              <ArrowRight className="h-3 w-3" />
            </a>

            <h1 className="mt-7 bg-gradient-to-b from-white to-white/50 bg-clip-text text-5xl font-semibold leading-[1.05] tracking-tight text-transparent sm:text-6xl">
              Docker 镜像
              <br />
              全球边缘加速
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              一个 Cloudflare Worker，按 Registry v2 协议代理 Docker Hub，
              让国内 <span className="font-mono text-foreground">docker pull</span>{" "}
              又快又稳。
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="rounded-full px-6 font-medium">
                <a href="#usage">
                  开始使用
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full border-border/70 bg-transparent px-6 font-medium hover:bg-secondary/60"
              >
                <a
                  href="https://github.com/sumce/docker-hub"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Github className="h-4 w-4" />
                  查看源码
                </a>
              </Button>
            </div>

            <div className="mx-auto mt-14 max-w-xl text-left">
              <Terminal
                title="~ docker pull"
                copyText={`docker pull ${host}/library/nginx:latest`}
                lines={[
                  { text: `docker pull ${host}/library/nginx:latest`, prompt: true },
                  { text: "latest: Pulling from library/nginx", muted: true },
                  { text: "3b1eb73d3d0e: Pull complete", muted: true },
                  { text: "b3f4e6e1a2c9: Pull complete", muted: true },
                  { text: "Status: Downloaded newer image for nginx:latest", muted: true },
                  { text: "✓ pulled via edge in 1.2s", muted: false },
                ]}
              />
            </div>
          </div>
        </section>

        {/* Features (bento) */}
        <section id="features" className="border-b border-border/60">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                为拉取而生的代理
              </h2>
              <p className="mt-3 text-muted-foreground">
                无需服务器、无需运维，一次部署长期可用。
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border/60 bg-border/60 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="group bg-background p-6 transition-colors hover:bg-secondary/30"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/70 bg-secondary/40 text-foreground">
                    <f.icon className="h-5 w-5" strokeWidth={1.8} />
                  </div>
                  <h3 className="mt-4 text-base font-medium">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Usage */}
        <section id="usage" className="border-b border-border/60">
          <div className="mx-auto max-w-3xl px-5 py-20">
            <div className="text-center">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                两种用法，任选其一
              </h2>
              <p className="mt-3 text-muted-foreground">
                加速地址：
                <span className="ml-1 font-mono text-foreground">{host}</span>
              </p>
            </div>

            <Tabs defaultValue="mirror" className="mt-10 w-full">
              <TabsList className="mx-auto grid w-full max-w-md grid-cols-2 rounded-full">
                <TabsTrigger value="mirror" className="rounded-full">
                  <Server className="mr-1.5 h-4 w-4" />
                  镜像加速器
                </TabsTrigger>
                <TabsTrigger value="prefix" className="rounded-full">
                  <Globe className="mr-1.5 h-4 w-4" />
                  前缀直拉
                </TabsTrigger>
              </TabsList>

              <TabsContent value="mirror" className="mt-8 space-y-4">
                <p className="text-sm text-muted-foreground">
                  编辑 <code className="font-mono text-foreground">/etc/docker/daemon.json</code>
                  （Windows / Mac 在 Docker Desktop → Settings → Docker Engine）：
                </p>
                <CodeBlock code={daemonJson} />
                <p className="text-sm text-muted-foreground">
                  重启 Docker 后，<code className="font-mono text-foreground">docker pull nginx</code>{" "}
                  会自动走加速：
                </p>
                <CodeBlock code={restartCmd} />
              </TabsContent>

              <TabsContent value="prefix" className="mt-8 space-y-4">
                <p className="text-sm text-muted-foreground">
                  不改任何配置，临时在镜像名前加上加速域名即可：
                </p>
                <CodeBlock code={pullCmd} />
                <p className="text-sm text-muted-foreground">
                  官方镜像（nginx、redis 等）需带{" "}
                  <code className="font-mono text-foreground">library/</code>{" "}
                  前缀，代理会自动补全并重定向。
                </p>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="border-b border-border/60">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                它是怎么工作的
              </h2>
              <p className="mt-3 text-muted-foreground">
                Docker 拉取走的是「令牌鉴权」流程，代理的关键就是把鉴权地址改写回自己。
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border/60 bg-border/60 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s) => (
                <div key={s.k} className="bg-background p-6">
                  <div className="font-mono text-sm text-muted-foreground">
                    {s.k}
                  </div>
                  <h3 className="mt-3 text-base font-medium">{s.t}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {s.d}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden border-b border-border/60">
          <div className="pointer-events-none absolute inset-0 hero-glow" />
          <div className="relative mx-auto max-w-3xl px-5 py-24 text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              几分钟部署你自己的加速节点
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              克隆仓库，<code className="font-mono text-foreground">npm run deploy</code>，
              绑定你的域名即可。
            </p>
            <div className="mt-8 flex justify-center">
              <Button asChild size="lg" className="rounded-full px-6 font-medium">
                <a
                  href="https://github.com/sumce/docker-hub"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Github className="h-4 w-4" />
                  前往 GitHub 部署
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </section>

        <SiteFooter />
      </div>
    </>
  );
}
