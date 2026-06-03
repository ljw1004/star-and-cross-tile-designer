import { GROUT_COLORS, MANUFACTURERS } from "./constants";
import type { GroutColor, PaletteColor } from "./types";

export function paletteColor(colorId: string): PaletteColor {
  for (const manufacturer of MANUFACTURERS) {
    const color = manufacturer.colors.find((candidate) => candidate.id === colorId);
    if (color) {
      return color;
    }
  }
  return MANUFACTURERS[0].colors[0];
}

export function groutColorValue(colorId: string): string {
  return groutColor(colorId).value;
}

export function groutColor(colorId: string): GroutColor {
  return GROUT_COLORS.find((candidate) => candidate.id === colorId) ?? GROUT_COLORS[0];
}

export function darken(hex: string, amount: number): string {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized, 16);
  const r = Math.max(0, ((value >> 16) & 255) - amount);
  const g = Math.max(0, ((value >> 8) & 255) - amount);
  const b = Math.max(0, (value & 255) - amount);
  return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}
