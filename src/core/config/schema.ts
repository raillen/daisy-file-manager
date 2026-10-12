import type { ColorToken } from "../theme/palette";
import type { LocaleCode } from "../i18n/translator";
import type { IconSet } from "../theme/icons";

export type ViewMode = "list" | "grid";
export type SortField = "name" | "size" | "modified" | "kind";
export type ImageProtocol = "auto" | "kitty" | "sixel" | "blocks";

export type PreviewConfig = {
  enabled: boolean;
  protocol: ImageProtocol;
  maxTextBytes: number;
};

export type Config = {
  theme: "light" | "dark";
  locale: LocaleCode;
  iconSet: IconSet;
  editor: string;
  defaultView: ViewMode;
  showHidden: boolean;
  sortBy: SortField;
  sortDescending: boolean;
  splitPane: boolean;
  colors: Partial<Record<ColorToken, string>>;
  bookmarks: string[];
  keymap: Record<string, string[]>;
  preview: PreviewConfig;
};

export const defaultConfig: Config = {
  theme: "dark",
  locale: "pt-BR",
  iconSet: "nerd",
  editor: process.env.VISUAL ?? process.env.EDITOR ?? "vi",
  defaultView: "list",
  showHidden: false,
  sortBy: "name",
  sortDescending: false,
  splitPane: false,
  colors: {},
  bookmarks: [],
  keymap: {},
  preview: { enabled: true, protocol: "auto", maxTextBytes: 262144 },
};

export const configFileName = "config.toml";

export type ConfigOverride = Omit<Partial<Config>, "colors" | "bookmarks" | "keymap" | "preview"> & {
  colors?: Partial<Record<ColorToken, string>>;
  bookmarks?: string[];
  keymap?: Record<string, string[]>;
  preview?: Partial<PreviewConfig>;
};