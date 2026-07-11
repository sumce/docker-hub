import { Github } from "lucide-react";

import { Button } from "@/components/ui/button";

export function SiteNav() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
        <a href="#" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo/unsiao_b.svg"
            alt="UNSIAO"
            className="h-8 w-auto [filter:invert(1)]"
          />
          <span className="text-lg font-semibold tracking-tight">
            UNSIAO™
          </span>
        </a>

        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <a href="#usage" className="transition-colors hover:text-foreground">
            使用
          </a>
          <a
            href="#features"
            className="transition-colors hover:text-foreground"
          >
            特性
          </a>
          <a
            href="#how-it-works"
            className="transition-colors hover:text-foreground"
          >
            原理
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
          >
            <a
              href="https://github.com/sumce/docker-hub"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
          </Button>
          <Button asChild size="sm" className="rounded-full font-medium">
            <a href="#usage">开始使用</a>
          </Button>
        </div>
      </div>
    </header>
  );
}
