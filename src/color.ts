import { MANUFACTURERS } from "./constants";
import type { AppState, Manufacturer } from "./types";

export function currentManufacturer(state: AppState): Manufacturer {
  return MANUFACTURERS.find((manufacturer) => manufacturer.id === state.manufacturerId) ?? MANUFACTURERS[0];
}

export function colorValue(colorId: string): string {
  for (const manufacturer of MANUFACTURERS) {
    const color = manufacturer.colors.find((candidate) => candidate.id === colorId);
    if (color) {
      return color.value;
    }
  }
  return MANUFACTURERS[0].colors[0].value;
}

export function darken(hex: string, amount: number): string {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized, 16);
  const r = Math.max(0, ((value >> 16) & 255) - amount);
  const g = Math.max(0, ((value >> 8) & 255) - amount);
  const b = Math.max(0, (value & 255) - amount);
  return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

export function outlineColor(hex: string): string {
  return darken(hex, 34);
}
