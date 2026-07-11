import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Docker Hub 镜像加速 · Cloudflare Worker",
  description:
    "基于 Cloudflare Worker 的 Docker Registry 代理，加速国内 docker pull 拉取。",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
