import type { LocaleCode } from "../i18n/translator";
import type { IconSet } from "../theme/icons";
import type { ColorToken, ThemeName } from "../theme/palette";

import type { Config, ConfigOverride, ImageProtocol, PreviewConfig, SortField, ViewMode } from "./schema";

export type RawConfig = Record<string, unknown>;

export type ParseResult = {
  config: ConfigOverride;
  warnings: string[];
};

const THEMES: readonly ThemeName[] = ["dark", "light", "wired", "cyberpunk", "retro"] as const;
const LOCALES: LocaleCode[] = ["pt-BR", "en-US"];
const ICON_SETS: IconSet[] = ["nerd", "unicode"];
const VIEW_MODES: ViewMode[] = ["list", "grid"];
const SORT_FIELDS: SortField[] = ["name", "size", "modified", "kind"];
const PROTOCOLS: ImageProtocol[] = ["auto", "kitty", "sixel", "blocks"];
const HEX_COLOR = /^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/;

function readBoolean(source: RawConfig, key: string, warnings: string[]): boolean | undefined {
  const value = source[key];
  if (value === undefined) return undefined;
  if (typeof value !== "boolean") {
    warnings.push(`config.${key}: esperado booleano, recebido ${typeof value}`);
    return undefined;
  }
  return value;
}

function readString(source: RawConfig, key: string, warnings: string[]): string | undefined {
  const value = source[key];
  if (value === undefined) return undefined;
  if (typeof value !== "string") {
    warnings.push(`config.${key}: esperado texto, recebido ${typeof value}`);
    return undefined;
  }
  return value;
}

function readPositiveInt(source: RawConfig, key: string, warnings: string[]): number | undefined {
  const value = source[key];
  if (value === undefined) return undefined;
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    warnings.push(`config.${key}: esperado inteiro positivo`);
    return undefined;
  }
  return value;
}

function readEnum<T extends string>(
  source: RawConfig,
  key: string,
  allowed: readonly T[],
  warnings: string[],
): T | undefined {
  const value = readString(source, key, warnings);
  if (value === undefined) return undefined;
  if (!allowed.includes(value as T)) {
    warnings.push(`config.${key}: valor inválido "${value}" (esperado ${allowed.join(" | ")})`);
    return undefined;
  }
  return value as T;
}

function readStringArray(source: RawConfig, key: string, warnings: string[]): string[] | undefined {
  const value = source[key];
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    warnings.push(`config.${key}: esperado lista de textos`);
    return undefined;
  }
  return value as string[];
}

function readTable(source: RawConfig, key: string, warnings: string[]): RawConfig | undefined {
  const value = source[key];
  if (value === undefined) return undefined;
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    warnings.push(`config.${key}: esperado bloco [${key}]`);
    return undefined;
  }
  return value as RawConfig;
}

function parseColors(table: RawConfig | undefined, warnings: string[]): Partial<Config["colors"]> | undefined {
  if (table === undefined) return undefined;
  const colors: Partial<Config["colors"]> = {};
  for (const [name, value] of Object.entries(table)) {
    if (typeof value !== "string" || !HEX_COLOR.test(value)) {
      warnings.push(`config.colors.${name}: esperado cor hexadecimal`);
      continue;
    }
    colors[name as ColorToken] = value;
  }
  return colors;
}

function parsePreview(table: RawConfig | undefined, warnings: string[]): Partial<PreviewConfig> | undefined {
  if (table === undefined) return undefined;
  const preview: Partial<PreviewConfig> = {};
  const enabled = readBoolean(table, "enabled", warnings);
  if (enabled !== undefined) preview.enabled = enabled;
  const protocol = readEnum(table, "protocol", PROTOCOLS, warnings);
  if (protocol !== undefined) preview.protocol = protocol;
  const maxTextBytes = readPositiveInt(table, "maxTextBytes", warnings);
  if (maxTextBytes !== undefined) preview.maxTextBytes = maxTextBytes;
  return preview;
}

function parseBookmarks(table: RawConfig | undefined, warnings: string[]): string[] | undefined {
  if (table === undefined) return undefined;
  return readStringArray(table, "paths", warnings);
}

function parseKeymap(table: RawConfig | undefined, warnings: string[]): Config["keymap"] | undefined {
  if (table === undefined) return undefined;
  const keymap: Config["keymap"] = {};
  for (const [command, value] of Object.entries(table)) {
    if (!Array.isArray(value) || value.some((key) => typeof key !== "string")) {
      warnings.push(`config.keymap.${command}: esperado lista de teclas`);
      continue;
    }
    keymap[command] = value as string[];
  }
  return keymap;
}

export function parseTomlConfig(source: string): ParseResult {
  const warnings: string[] = [];

  let parsed: RawConfig;
  try {
    parsed = Bun.TOML.parse(source) as RawConfig;
  } catch (error) {
    return { config: {}, warnings: [`config: TOML inválido (${String(error)})`] };
  }

  const config: ConfigOverride = {};
  if (parsed.theme === "default") {
    config.theme = "dark";
  } else {
    const theme = readEnum(parsed, "theme", THEMES, warnings);
    if (theme !== undefined) config.theme = theme;
  }
  const locale = readEnum(parsed, "locale", LOCALES, warnings);
  if (locale !== undefined) config.locale = locale;
  const iconSet = readEnum(parsed, "iconSet", ICON_SETS, warnings);
  if (iconSet !== undefined) config.iconSet = iconSet;

  if (typeof parsed.editor === "string") {
    config.editor = parsed.editor;
  } else if (typeof parsed.editor === "object" && parsed.editor !== null && !Array.isArray(parsed.editor)) {
    const table = parsed.editor as Record<string, unknown>;
    const cmd = table.command ?? table.program ?? table.path ?? table.bin;
    if (typeof cmd === "string") {
      config.editor = cmd;
    }
  } else if (parsed.editor !== undefined) {
    warnings.push(`config.editor: esperado texto, recebido ${typeof parsed.editor}`);
  }
  const defaultView = readEnum(parsed, "defaultView", VIEW_MODES, warnings);
  if (defaultView !== undefined) config.defaultView = defaultView;
  const showHidden = readBoolean(parsed, "showHidden", warnings);
  if (showHidden !== undefined) config.showHidden = showHidden;
  const sortBy = readEnum(parsed, "sortBy", SORT_FIELDS, warnings);
  if (sortBy !== undefined) config.sortBy = sortBy;
  const sortDescending = readBoolean(parsed, "sortDescending", warnings);
  if (sortDescending !== undefined) config.sortDescending = sortDescending;
  const splitPane = readBoolean(parsed, "splitPane", warnings);
  if (splitPane !== undefined) config.splitPane = splitPane;

  const colors = parseColors(readTable(parsed, "colors", warnings), warnings);
  if (colors !== undefined) config.colors = colors;
  const bookmarks = parseBookmarks(readTable(parsed, "bookmarks", warnings), warnings);
  if (bookmarks !== undefined) config.bookmarks = bookmarks;
  const keymap = parseKeymap(readTable(parsed, "keymap", warnings), warnings);
  if (keymap !== undefined) config.keymap = keymap;
  const preview = parsePreview(readTable(parsed, "preview", warnings), warnings);
  if (preview !== undefined) config.preview = preview;

  return { config, warnings };
}

function mergePreview(base: PreviewConfig, override: Partial<PreviewConfig> | undefined): PreviewConfig {
  if (override === undefined) return base;
  return { ...base, ...override };
}

export function mergeConfig(base: Config, override: ConfigOverride): Config {
  return {
    ...base,
    ...override,
    colors: { ...base.colors, ...override.colors },
    bookmarks: override.bookmarks ?? base.bookmarks,
    keymap: { ...base.keymap, ...override.keymap },
    preview: mergePreview(base.preview, override.preview),
  };
}
