"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/** Logo 路径（来自 unsiao_b.svg，viewBox 1024×1536） */
const LOGO_PATHS = [
  "M 342.33 421.64 C 346.11 420.53 350.08 420.57 353.98 420.57 C 388.66 420.59 423.33 420.60 458.01 420.58 C 464.28 420.69 470.62 420.16 476.83 421.28 C 491.17 424.59 500.59 440.88 496.93 455.00 C 493.00 472.34 487.72 489.34 483.44 506.59 C 461.26 588.62 439.14 670.67 417.99 752.98 C 398.91 826.39 380.21 899.89 361.38 973.37 C 354.97 1000.03 347.62 1026.46 341.08 1053.10 C 339.58 1058.20 338.44 1063.44 336.30 1068.33 C 331.40 1078.59 320.41 1085.52 308.99 1085.22 C 253.33 1085.18 197.66 1085.32 142.00 1085.13 C 127.23 1085.65 112.49 1074.16 111.06 1059.11 C 110.27 1052.30 111.94 1045.51 114.22 1039.14 C 154.30 922.56 194.14 805.91 234.26 689.34 C 262.34 608.92 290.40 528.50 319.26 448.35 C 321.65 440.84 324.76 433.11 330.77 427.74 C 334.07 424.83 338.11 422.83 342.33 421.64 Z",
  "M 536.39 421.48 C 541.84 420.21 547.48 420.66 553.03 420.61 C 584.34 420.60 615.65 420.58 646.96 420.60 C 650.59 420.66 654.28 420.64 657.87 421.36 C 667.68 423.93 675.68 432.42 677.60 442.39 C 679.55 451.66 676.83 460.96 675.33 470.08 C 663.56 537.77 651.13 605.34 638.61 672.90 C 637.34 679.38 638.76 686.72 643.34 691.66 C 646.78 694.71 651.26 696.92 655.94 696.94 C 695.94 696.89 735.95 696.88 775.95 696.93 C 783.06 696.65 790.19 699.87 794.80 705.26 C 797.79 708.60 799.63 712.76 801.19 716.92 C 824.34 783.35 848.49 849.43 872.31 915.63 C 879.92 936.67 887.76 957.62 895.31 978.68 C 902.36 998.56 910.03 1018.21 916.93 1038.14 C 919.91 1046.41 923.50 1055.33 921.13 1064.23 C 918.17 1077.07 904.91 1085.75 892.04 1085.19 C 782.05 1085.29 672.07 1085.23 562.08 1085.20 C 554.92 1085.56 547.53 1083.70 541.88 1079.18 C 534.33 1073.42 531.41 1063.21 532.87 1054.07 C 534.56 1042.96 537.16 1032.02 539.05 1020.95 C 549.63 968.16 559.20 915.19 569.66 862.38 C 576.84 824.60 584.30 786.87 591.01 749.01 C 592.83 740.84 590.36 731.63 583.92 726.11 C 579.21 721.48 572.41 719.71 565.95 719.80 C 537.30 719.66 508.64 719.73 479.98 719.74 C 472.64 719.88 465.02 717.49 459.74 712.25 C 453.08 705.47 450.96 695.12 453.13 686.02 C 460.10 657.48 468.52 629.32 475.87 600.88 C 490.47 546.62 505.90 492.60 520.31 438.30 C 522.29 430.44 528.47 423.58 536.39 421.48 Z",
];

const VIEW_W = 1024;
const VIEW_H = 1536;

interface Block {
  x: number;
  y: number;
  w: number;
  h: number;
  disappearTime: number;
}

function randomNormal(mean: number, stdDev: number): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return mean + stdDev * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

export function ParticleLoader({ onDone }: { onDone?: () => void }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const percentRef = React.useRef<HTMLSpanElement>(null);
  const [fading, setFading] = React.useState(false);
  const [gone, setGone] = React.useState(false);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // —— 可调参数（配色适配深色背景，Docker 蓝粒子） ——
    const P = {
      sampleStep: 9,
      sizeBase: 1.2,
      sizeVariance: 2.5,
      spawnRadius: 320,
      speedBase: 0.01,
      speedVariance: 0.018,
      frictionBase: 0.91,
      frictionVariance: 0.03,
      pull: 0.15,
      jitter: 0.08,
      color: "96, 165, 250",
      maxAlpha: 0.9,
    };
    const timing = {
      convergeSpeed: 0.009,
      solidifySpeed: 0.03,
      holdFrames: 36,
      disappearSpeed: 0.02,
      disappearEnd: 1.3,
    };
    const dissolve = { cols: 40, padding: 20 };
    const logoColor = "#93c5fd";

    canvas.width = VIEW_W;
    canvas.height = VIEW_H;

    const paths = LOGO_PATHS.map((d) => new Path2D(d));

    let logoBounds = { minX: VIEW_W, maxX: 0, minY: VIEW_H, maxY: 0 };
    const targets: { x: number; y: number }[] = [];
    let blocks: Block[] = [];

    let progress = 0;
    let phase: "converge" | "solidify" | "hold" | "disappear" = "converge";
    let solidOpacity = 0;
    let holdFrameCount = 0;
    let disappearProgress = 0;
    let rafId = 0;
    let cancelled = false;

    // 依据显示区域计算画布 CSS 尺寸（contain）
    const applyDisplaySize = () => {
      const maxW = Math.min(340, window.innerWidth * 0.8);
      const maxH = Math.min(520, window.innerHeight * 0.55);
      const ratio = VIEW_W / VIEW_H;
      let dispW = maxW;
      let dispH = maxW / ratio;
      if (dispH > maxH) {
        dispH = maxH;
        dispW = maxH * ratio;
      }
      canvas.style.width = `${dispW}px`;
      canvas.style.height = `${dispH}px`;
    };
    applyDisplaySize();
    window.addEventListener("resize", applyDisplaySize);

    // 采样 Logo 像素为目标点
    const generateTargets = () => {
      const off = document.createElement("canvas");
      off.width = VIEW_W;
      off.height = VIEW_H;
      const oc = off.getContext("2d");
      if (!oc) return;
      oc.fillStyle = "#ffffff";
      paths.forEach((p) => oc.fill(p));
      const data = oc.getImageData(0, 0, VIEW_W, VIEW_H).data;
      const step = P.sampleStep;
      let minX = VIEW_W;
      let maxX = 0;
      let minY = VIEW_H;
      let maxY = 0;
      for (let y = 0; y < VIEW_H; y += step) {
        for (let x = 0; x < VIEW_W; x += step) {
          if (data[(y * VIEW_W + x) * 4 + 3] > 128) {
            targets.push({ x, y });
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
      logoBounds = { minX, maxX, minY, maxY };
    };

    const initBlocks = () => {
      blocks = [];
      const startX = Math.max(0, logoBounds.minX - dissolve.padding);
      const endX = Math.min(VIEW_W, logoBounds.maxX + dissolve.padding);
      const startY = Math.max(0, logoBounds.minY - dissolve.padding);
      const endY = Math.min(VIEW_H, logoBounds.maxY + dissolve.padding);
      const boundsW = endX - startX;
      const boundsH = endY - startY;
      const cols = dissolve.cols;
      const cell = boundsW / cols;
      const rows = Math.max(1, Math.round(boundsH / cell));
      const cellW = boundsW / cols;
      const cellH = boundsH / rows;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          blocks.push({
            x: startX + c * cellW,
            y: startY + r * cellH,
            w: cellW,
            h: cellH,
            disappearTime: Math.random(),
          });
        }
      }
    };

    class Particle {
      tx: number;
      ty: number;
      x = 0;
      y = 0;
      vx = 0;
      vy = 0;
      size = 1;
      speedFactor = 0;
      friction = 0.9;
      alpha = 0;

      constructor(tx: number, ty: number) {
        this.tx = tx;
        this.ty = ty;
        const angle = Math.random() * Math.PI * 2;
        const r = Math.abs(randomNormal(0, P.spawnRadius));
        this.x = VIEW_W / 2 + Math.cos(angle) * r;
        this.y = VIEW_H / 2 + Math.sin(angle) * r;
        this.size = Math.random() * P.sizeVariance + P.sizeBase;
        this.speedFactor = P.speedBase + Math.random() * P.speedVariance;
        this.friction = P.frictionBase + Math.random() * P.frictionVariance;
      }

      update() {
        if (this.alpha < 1) this.alpha += 0.05;
        if (phase === "converge") {
          const dx = this.tx - this.x;
          const dy = this.ty - this.y;
          this.vx += dx * this.speedFactor * P.pull;
          this.vy += dy * this.speedFactor * P.pull;
          this.vx *= this.friction;
          this.vy *= this.friction;
          this.x += this.vx;
          this.y += this.vy;
        } else if (phase === "solidify" || phase === "hold") {
          this.x += Math.sin(Date.now() * 0.002 + this.ty) * P.jitter;
          this.y += Math.cos(Date.now() * 0.002 + this.tx) * P.jitter;
        }
      }

      draw(c: CanvasRenderingContext2D) {
        if (phase === "disappear") return;
        const a = this.alpha * (P.maxAlpha - solidOpacity * P.maxAlpha);
        c.fillStyle = `rgba(${P.color}, ${a})`;
        c.beginPath();
        c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        c.fill();
      }
    }

    generateTargets();
    const particles = targets.map((t) => new Particle(t.x, t.y));
    initBlocks();

    const setPercent = (v: number) => {
      if (percentRef.current) percentRef.current.textContent = `${v}%`;
    };

    const finish = () => {
      setFading(true);
      window.setTimeout(() => {
        setGone(true);
        onDone?.();
      }, 700);
    };

    const drawSolid = (opacity: number) => {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.fillStyle = logoColor;
      ctx.shadowColor = "rgba(96, 165, 250, 0.35)";
      ctx.shadowBlur = 24;
      paths.forEach((p) => ctx.fill(p));
      ctx.restore();
    };

    const drawMasks = () => {
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,1)";
      blocks.forEach((b) => {
        if (disappearProgress > b.disappearTime) {
          ctx.fillRect(b.x - 0.5, b.y - 0.5, b.w + 1, b.h + 1);
        }
      });
      ctx.restore();
    };

    const animate = () => {
      if (cancelled) return;
      ctx.clearRect(0, 0, VIEW_W, VIEW_H);

      if (phase === "converge") {
        progress += timing.convergeSpeed;
        if (progress >= 1) {
          progress = 1;
          phase = "solidify";
        }
      } else if (phase === "solidify") {
        solidOpacity += timing.solidifySpeed;
        if (solidOpacity >= 1) {
          solidOpacity = 1;
          phase = "hold";
          holdFrameCount = 0;
        }
      } else if (phase === "hold") {
        holdFrameCount++;
        if (holdFrameCount > timing.holdFrames) {
          phase = "disappear";
          disappearProgress = 0;
        }
      } else if (phase === "disappear") {
        disappearProgress += timing.disappearSpeed;
        if (disappearProgress >= timing.disappearEnd) {
          finish();
          return;
        }
      }

      setPercent(phase === "converge" ? Math.round(progress * 100) : 100);

      particles.forEach((p) => {
        p.update();
        p.draw(ctx);
      });
      if (solidOpacity > 0) drawSolid(solidOpacity);
      if (phase === "disappear") drawMasks();

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", applyDisplaySize);
    };
  }, [onDone]);

  if (gone) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity duration-700",
        fading && "pointer-events-none opacity-0",
      )}
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[120px]" />
      <canvas ref={canvasRef} className="relative" />
      <div className="mt-4 flex items-center text-sm font-medium tracking-wide text-muted-foreground">
        <span>正在加载中</span>
        <span className="loader-dots" />
        <span ref={percentRef} className="ml-1 min-w-[2.6em] text-left tabular-nums text-foreground">
          0%
        </span>
      </div>
    </div>
  );
}
