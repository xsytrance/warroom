"use client";

import { useEffect, useRef } from "react";

export type VisualizerMode = "bars" | "wave" | "pulse" | "scope";

type Props = {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
  mode: VisualizerMode;
  className?: string;
};

export function AudioVisualizer({ analyser, isPlaying, mode, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const peaksRef = useRef<Float32Array>(new Float32Array(48));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const bars = 48;
    const freqData = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;
    const timeData = analyser ? new Uint8Array(analyser.fftSize) : null;

    const resize = () => {
      const w = Math.max(220, canvas.clientWidth);
      const h = Math.max(46, canvas.clientHeight || 56);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const drawIdle = (w: number, h: number) => {
      ctx.clearRect(0, 0, w, h);
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, "rgba(34,211,238,0.08)");
      grad.addColorStop(1, "rgba(14,116,144,0.02)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = "rgba(34,211,238,0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.66);
      for (let x = 0; x <= w; x += 12) {
        const y = h * 0.66 + Math.sin(x * 0.035) * 1.5;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    const drawBars = (w: number, h: number, data: Uint8Array) => {
      const gap = 2;
      const barW = (w - gap * (bars - 1)) / bars;
      const peaks = peaksRef.current;

      for (let i = 0; i < bars; i += 1) {
        const idx = Math.floor((i / bars) * Math.max(8, data.length * 0.78));
        const val = data[idx] / 255;
        const barH = Math.max(1.4, val * h * 0.92);

        if (barH > peaks[i]) peaks[i] = barH;
        else peaks[i] *= 0.92;

        const x = i * (barW + gap);
        const y = h - barH;

        const r = Math.round(130 - val * 70);
        const g = Math.round(90 + val * 140);
        const b = Math.round(220 + val * 24);

        const gBar = ctx.createLinearGradient(x, y, x, h);
        gBar.addColorStop(0, `rgba(${r},${g},${b},0.92)`);
        gBar.addColorStop(1, `rgba(${r},${g},${b},0.22)`);
        ctx.fillStyle = gBar;
        ctx.fillRect(x, y, barW, barH);

        if (peaks[i] > 2.5) {
          ctx.fillStyle = `rgba(${r},${g},${b},0.85)`;
          ctx.fillRect(x, h - peaks[i] - 1.2, barW, 1.2);
        }
      }
    };

    const drawWave = (w: number, h: number, data: Uint8Array) => {
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = "rgba(56,189,248,0.92)";
      ctx.beginPath();
      for (let i = 0; i < data.length; i += 1) {
        const x = (i / (data.length - 1)) * w;
        const y = (data[i] / 255) * h;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    const drawPulse = (w: number, h: number, data: Uint8Array) => {
      let sum = 0;
      for (let i = 0; i < data.length; i += 1) sum += data[i];
      const amp = sum / (data.length * 255);
      const radius = Math.max(8, Math.min(h, w) * (0.18 + amp * 0.34));
      const cx = w / 2;
      const cy = h / 2;

      const glow = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius * 1.3);
      glow.addColorStop(0, `rgba(34,211,238,${0.16 + amp * 0.48})`);
      glow.addColorStop(1, "rgba(8,47,73,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(103,232,249,0.95)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();
    };

    const drawScope = (w: number, h: number, freq: Uint8Array, time: Uint8Array) => {
      drawBars(w, h, freq);
      ctx.globalAlpha = 0.9;
      ctx.strokeStyle = "rgba(125,211,252,0.75)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < time.length; i += 1) {
        const x = (i / (time.length - 1)) * w;
        const y = (time[i] / 255) * h;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    const frame = () => {
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);

      if (!analyser || !freqData || !isPlaying) {
        drawIdle(w, h);
        rafRef.current = requestAnimationFrame(frame);
        return;
      }

      analyser.getByteFrequencyData(freqData);

      if (mode === "bars") {
        drawBars(w, h, freqData);
      } else if (mode === "wave") {
        const td = timeData ?? new Uint8Array(analyser.fftSize);
        analyser.getByteTimeDomainData(td);
        drawWave(w, h, td);
      } else if (mode === "pulse") {
        drawPulse(w, h, freqData);
      } else {
        const td = timeData ?? new Uint8Array(analyser.fftSize);
        analyser.getByteTimeDomainData(td);
        drawScope(w, h, freqData, td);
      }

      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [analyser, isPlaying, mode]);

  return <canvas ref={canvasRef} className={className} aria-label="Audio visualizer" role="img" />;
}
