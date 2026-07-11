"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  className?: string;
}

export function CodeBlock({ code, className }: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);

  const onCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* 剪贴板不可用时忽略 */
    }
  }, [code]);

  return (
    <div
      className={cn(
        "group relative rounded-lg border bg-zinc-950/80 dark:bg-black/50",
        className,
      )}
    >
      <pre className="overflow-x-auto p-4 pr-12 text-sm leading-relaxed">
        <code className="font-mono text-zinc-100">{code}</code>
      </pre>
      <button
        type="button"
        onClick={onCopy}
        aria-label="复制代码"
        className="absolute right-2.5 top-2.5 inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-400" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
