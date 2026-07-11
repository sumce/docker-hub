"use client";

import * as React from "react";
import {
  Anchor,
  ArrowRight,
  Github,
  Globe,
  KeyRound,
  Server,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeBlock } from "@/components/code-block";
import { ParticleLoader } from "@/components/particle-loader";
import { cn } from "@/lib/utils";

export default function Home() {
  const [host, setHost] = React.useState("your-worker.workers.dev");
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setHost(window.location.host);
    }
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
      desc: "Cloudflare 边缘节点就近转发，无需自建服务器。",
    },
    {
      icon: KeyRound,
      title: "自动令牌鉴权",
      desc: "透明改写 Registry v2 鉴权流程，pull 无感知。",
    },
    {
      icon: Zap,
      title: "免费额度充足",
      desc: "每天 10 万次请求免费额度，个人使用绰绰有余。",
    },
  ];

  const steps = [
    "客户端访问 /v2/，上游返回 401 并告知去哪换 token。",
    "Worker 把鉴权地址改写为本站 /v2/auth。",
    "客户端带 scope 回来，Worker 代它向上游换取 token。",
    "客户端带 token 拉取 manifests / blobs，Worker 透明转发。",
  ];

  return (
    <>
      <ParticleLoader onDone={() => setReady(true)} />

      <div className="relative overflow-hidden">
        {/* 背景网格 + 光晕 */}
        <div className="pointer-events-none absolute inset-0 bg-grid" />
        <div className="pointer-events-none absolute left-1/2 top-[-12rem] h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[130px]" />

        <main
          className={cn(
            "relative mx-auto max-w-3xl px-5 pb-24 transition-all duration-700 ease-out",
            ready ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
          )}
        >
          {/* Hero */}
          <section className="pt-24 text-center">
            <Badge
              variant="secondary"
              className="mb-6 gap-1.5 rounded-full border border-border/60 px-3 py-1 text-xs"
            >
              <Zap className="h-3.5 w-3.5 text-primary" />
              Powered by Cloudflare Workers
            </Badge>

            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 ring-1 ring-primary/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo/unsiao_b.svg"
                  alt="logo"
                  className="h-11 w-11 opacity-90 [filter:invert(64%)_sepia(69%)_saturate(1000%)_hue-rotate(185deg)]"
                />
              </div>
            </div>

            <h1 className="bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
              Docker Hub 镜像加速
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
              基于 Cloudflare Worker 的 Docker Registry 代理，
              让国内 <code className="text-primary">docker pull</code> 又快又稳。
            </p>

            <div className="mt-8 inline-flex items-center gap-2 rounded-full border bg-card/70 px-4 py-2 text-sm shadow-sm backdrop-blur">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
              </span>
              <span className="text-muted-foreground">加速地址</span>
              <span className="font-mono font-medium text-primary">{host}</span>
            </div>
          </section>

          {/* 使用方式 */}
          <section className="mt-16">
            <Tabs defaultValue="mirror" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="mirror">
                  <Server className="mr-1.5 h-4 w-4" />
                  镜像加速器（推荐）
                </TabsTrigger>
                <TabsTrigger value="prefix">
                  <Anchor className="mr-1.5 h-4 w-4" />
                  前缀直拉
                </TabsTrigger>
              </TabsList>

              <TabsContent value="mirror">
                <Card>
                  <CardHeader>
                    <CardTitle>配置为镜像加速器</CardTitle>
                    <CardDescription>
                      编辑 <code>/etc/docker/daemon.json</code>（Windows / Mac 在
                      Docker Desktop → Settings → Docker Engine），加入下面的配置。
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CodeBlock code={daemonJson} />
                    <p className="text-sm text-muted-foreground">
                      然后重启 Docker，之后 <code>docker pull nginx</code>{" "}
                      会自动走加速：
                    </p>
                    <CodeBlock code={restartCmd} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="prefix">
                <Card>
                  <CardHeader>
                    <CardTitle>直接加前缀拉取</CardTitle>
                    <CardDescription>
                      不改任何配置，临时在镜像名前加上加速域名即可。
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CodeBlock code={pullCmd} />
                    <p className="text-sm text-muted-foreground">
                      官方镜像（nginx、redis 等）需带 <code>library/</code>{" "}
                      前缀，代理会自动补全并重定向。
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </section>

          {/* 特性 */}
          <section className="mt-16 grid gap-4 sm:grid-cols-3">
            {features.map((f) => (
              <Card
                key={f.title}
                className="border-border/60 transition-colors hover:border-primary/40"
              >
                <CardHeader>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="mt-2 text-base">{f.title}</CardTitle>
                  <CardDescription>{f.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </section>

          {/* 工作原理 */}
          <section className="mt-16">
            <Card className="bg-card/60">
              <CardHeader>
                <CardTitle>它是怎么工作的？</CardTitle>
                <CardDescription>
                  Docker 拉取走的是「令牌鉴权」流程，代理的关键就是把鉴权地址改写回自己。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3 text-sm text-muted-foreground">
                  {steps.map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {i + 1}
                      </span>
                      <span className="pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </section>

          {/* CTA */}
          <section className="mt-16 text-center">
            <Button asChild size="lg">
              <a
                href="https://github.com/sumce/docker-hub"
                target="_blank"
                rel="noreferrer"
              >
                <Github className="h-4 w-4" />
                查看源码
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </section>

          <footer className="mt-16 border-t pt-8 text-center text-sm text-muted-foreground">
            仅代理公开镜像，请遵守 Docker Hub 使用条款与速率限制。
          </footer>
        </main>
      </div>
    </>
  );
}
