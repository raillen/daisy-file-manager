import iconsSource from "../../../design/tokens/icons.json" with { type: "json" };
import type { ColorToken } from "./palette";

export type IconName = string;

export type IconSet = "nerd" | "unicode";

export type IconEntry = {
  name: IconName;
  phosphor: string;
  unicode: string;
  nerd: string | null;
  color: ColorToken;
};

const registry = new Map<IconName, IconEntry>(iconsSource.icons.map((entry) => [entry.name, entry as IconEntry]));

export function iconEntry(name: IconName): IconEntry | undefined {
  return registry.get(name);
}

export function phosphorClass(name: IconName): string {
  const entry = registry.get(name);
  return entry === undefined ? "ph ph-file" : entry.phosphor;
}

export function glyph(name: IconName, set: IconSet): string {
  const entry = registry.get(name);
  if (entry === undefined) return "?";
  if (set === "nerd" && entry.nerd !== null) return entry.nerd;
  return entry.unicode;
}

export function iconColor(name: IconName): ColorToken {
  return registry.get(name)?.color ?? "fg.default";
}
