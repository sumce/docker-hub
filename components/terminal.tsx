"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/utils";

interface TerminalProps {
  title?: string;
  lines: { text: string; muted?: boolean; prompt?: boolean }[];
  copyText?: string;
  className?: string;
}

export function Terminal({ title = "bash", lines, copyText, className }: TerminalProps) {
  const [copied, setCopied] = React.useState(false);

  const onCopy = React.useCallback(async () => {
    if (!copyText) return;
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }, [copyText]);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border/70 bg-card shadow-2xl shadow-black/40",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-border/70 bg-white/[0.02] px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="font-mono text-xs text-muted-foreground">{title}</span>
        {copyText ? (
          <button
            onClick={onCopy}
            aria-label="复制"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        ) : (
          <span className="w-3.5" />
        )}
      </div>
      <div className="space-y-1 p-4 font-mono text-[13px] leading-relaxed">
        {lines.map((line, i) => (
          <div
            key={i}
            className={cn(
              "whitespace-pre-wrap break-all",
              line.muted ? "text-muted-foreground" : "text-foreground",
            )}
          >
            {line.prompt && <span className="mr-2 text-primary/70">$</span>}
            {line.text}
          </div>
        ))}
      </div>
    </div>
  );
}
