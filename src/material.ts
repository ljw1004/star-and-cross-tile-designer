import { darken, paletteColor } from "./color";
import type { PaletteColor } from "./types";

export type MaterialBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function fillMaterialPath(ctx: CanvasRenderingContext2D, colorId: string, seed: string, bounds: MaterialBounds): void {
  const color = paletteColor(colorId);
  const random = seededRandom(seed);
  const variation = color.shadeVariation * 5;
  const base = adjustLightness(color.value, (random() - 0.5) * variation);
  const screenBounds = transformedBounds(ctx, bounds);

  ctx.fillStyle = base;
  ctx.fill();

  ctx.save();
  ctx.clip();
  drawClouding(ctx, color, random, bounds);
  drawGrain(ctx, color, random, bounds);
  drawStripes(ctx, color, random, bounds);
  drawChips(ctx, color, random, bounds);
  drawSheen(ctx, color, screenBounds);
  ctx.restore();
}

function drawClouding(
  ctx: CanvasRenderingContext2D,
  color: PaletteColor,
  random: () => number,
  bounds: MaterialBounds,
): void {
  if (color.clouding <= 0.01) {
    return;
  }

  const count = Math.max(2, Math.round(2 + color.clouding * 8));
  for (let i = 0; i < count; i += 1) {
    const x = bounds.x + random() * bounds.width;
    const y = bounds.y + random() * bounds.height;
    const radius = Math.max(bounds.width, bounds.height) * (0.15 + random() * 0.35);
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    const lighten = random() > 0.5;
    const cloudColor = lighten ? "#ffffff" : darken(color.value, 42);
    gradient.addColorStop(0, hexToRgba(cloudColor, 0.05 + color.clouding * 0.08));
    gradient.addColorStop(1, hexToRgba(cloudColor, 0));
    ctx.fillStyle = gradient;
    ctx.fillRect(bounds.x - radius, bounds.y - radius, bounds.width + radius * 2, bounds.height + radius * 2);
  }
}

function drawGrain(
  ctx: CanvasRenderingContext2D,
  color: PaletteColor,
  random: () => number,
  bounds: MaterialBounds,
): void {
  if (color.grain <= 0.01) {
    return;
  }

  const area = bounds.width * bounds.height;
  const count = Math.min(180, Math.round((area / 90) * color.grain));
  ctx.fillStyle = hexToRgba(darken(color.value, 55), 0.08 + color.grain * 0.18);
  for (let i = 0; i < count; i += 1) {
    const size = 0.6 + random() * (1 + color.grain * 2);
    ctx.fillRect(bounds.x + random() * bounds.width, bounds.y + random() * bounds.height, size, size);
  }
}

function drawStripes(
  ctx: CanvasRenderingContext2D,
  color: PaletteColor,
  random: () => number,
  bounds: MaterialBounds,
): void {
  if (color.texture !== "saltillo_terracotta" && color.texture !== "rustic_cotto" && color.texture !== "natural_terracotta") {
    return;
  }

  ctx.save();
  ctx.globalAlpha = 0.07;
  ctx.strokeStyle = darken(color.value, 48);
  ctx.lineWidth = 2 + color.clouding * 3;
  ctx.translate(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  ctx.rotate(-0.45 + random() * 0.25);
  const span = bounds.width + bounds.height;
  for (let y = -span; y <= span; y += 10 + random() * 9) {
    ctx.beginPath();
    ctx.moveTo(-span, y);
    ctx.lineTo(span, y + random() * 10 - 5);
    ctx.stroke();
  }
  ctx.restore();
}

function drawChips(
  ctx: CanvasRenderingContext2D,
  color: PaletteColor,
  random: () => number,
  bounds: MaterialBounds,
): void {
  if (color.chipRate <= 0.01) {
    return;
  }

  const count = Math.round(color.chipRate * 18);
  ctx.fillStyle = hexToRgba(darken(color.value, 70), 0.18);
  for (let i = 0; i < count; i += 1) {
    const edge = Math.floor(random() * 4);
    const x = edge === 1 ? bounds.x + bounds.width : edge === 3 ? bounds.x : bounds.x + random() * bounds.width;
    const y = edge === 0 ? bounds.y : edge === 2 ? bounds.y + bounds.height : bounds.y + random() * bounds.height;
    const radius = 1.5 + random() * (3 + color.chipRate * 8);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSheen(ctx: CanvasRenderingContext2D, color: PaletteColor, bounds: MaterialBounds): void {
  if (color.sheen <= 0.01) {
    return;
  }

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const gradient = ctx.createLinearGradient(bounds.x, bounds.y, bounds.x + bounds.width, bounds.y + bounds.height);
  gradient.addColorStop(0, "rgba(255,255,255,0)");
  gradient.addColorStop(0.34, `rgba(255,255,255,${0.04 + color.sheen * 0.12})`);
  gradient.addColorStop(0.47, `rgba(255,255,255,${0.13 + color.sheen * 0.28})`);
  gradient.addColorStop(0.6, `rgba(255,255,255,${0.03 + color.sheen * 0.08})`);
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
  ctx.restore();
}

function transformedBounds(ctx: CanvasRenderingContext2D, bounds: MaterialBounds): MaterialBounds {
  const transform = ctx.getTransform();
  const points = [
    transformPoint(transform, bounds.x, bounds.y),
    transformPoint(transform, bounds.x + bounds.width, bounds.y),
    transformPoint(transform, bounds.x + bounds.width, bounds.y + bounds.height),
    transformPoint(transform, bounds.x, bounds.y + bounds.height),
  ];
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

function transformPoint(transform: DOMMatrix, x: number, y: number): { x: number; y: number } {
  return {
    x: transform.a * x + transform.c * y + transform.e,
    y: transform.b * x + transform.d * y + transform.f,
  };
}

function seededRandom(seed: string): () => number {
  let value = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    value ^= seed.charCodeAt(i);
    value = Math.imul(value, 16777619);
  }

  return () => {
    value += 0x6d2b79f5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function adjustLightness(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(clampColor(r + amount), clampColor(g + amount), clampColor(b + amount));
}

function hexToRgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function clampColor(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}
