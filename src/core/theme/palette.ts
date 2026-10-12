import colorsSource from "../../../design/tokens/colors.json" with { type: "json" };

export type ThemeName = "light" | "dark";

export type ColorToken =
  | "bg.default"
  | "bg.muted"
  | "bg.inset"
  | "bg.overlay"
  | "bg.accent"
  | "bg.accentMuted"
  | "bg.successMuted"
  | "bg.attentionMuted"
  | "bg.dangerMuted"
  | "bg.selectedRow"
  | "fg.default"
  | "fg.muted"
  | "fg.onEmphasis"
  | "fg.accent"
  | "fg.success"
  | "fg.attention"
  | "fg.danger"
  | "fg.directory"
  | "fg.executable"
  | "fg.symlink"
  | "fg.hidden"
  | "border.default"
  | "border.muted"
  | "border.focus";

export type Palette = Record<ColorToken, string>;

type PaletteRow = { name: string; dark: string; light: string };

const rows = colorsSource.tokens as ReadonlyArray<PaletteRow>;

const knownTokens: ReadonlySet<string> = new Set(rows.map((row) => row.name));

function isColorToken(name: string): name is ColorToken {
  return knownTokens.has(name);
}

function pick(theme: ThemeName): Palette {
  const picked = {} as Palette;
  for (const row of rows) {
    if (!isColorToken(row.name)) {
      throw new Error(`Token de cor desconhecido em design/tokens/colors.json: ${row.name}`);
    }
    picked[row.name] = row[theme];
  }
  return picked;
}

export const palettes: Record<ThemeName, Palette> = {
  light: pick("light"),
  dark: pick("dark"),
};

export const defaultTheme: ThemeName = "dark";

export function paletteFor(theme: ThemeName): Palette {
  return palettes[theme];
}