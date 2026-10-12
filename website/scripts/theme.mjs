import { config } from "./config.mjs";

const THEME_STORAGE_KEY = config.storage.theme;
const ICON_BASES = ["../design", "./design"];

let activeTheme = "light";
let icons = new Map();
let colorsCache = null;

function readStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Modo privado: o tema continua valendo na sessão.
  }
}

function isDark(theme) {
  return theme === "dark";
}

function updateToggle() {
  const toggle = document.querySelector("#themeToggle");
  if (toggle === null) return;
  const label = isDark(activeTheme) ? "Ativar tema claro" : "Ativar tema escuro";
  const icon = toggle.querySelector(".ph");
  toggle.setAttribute("aria-label", label);
  toggle.setAttribute("title", label);
  toggle.setAttribute("aria-pressed", String(isDark(activeTheme)));
  if (icon !== null) icon.className = isDark(activeTheme) ? "ph ph-sun" : "ph ph-moon";
}

export function applyTheme(theme, persist) {
  activeTheme = isDark(theme) ? "dark" : "light";
  document.documentElement.dataset.theme = activeTheme;
  document.documentElement.style.colorScheme = activeTheme;
  paintColorTokens();
  updateToggle();
  if (persist) writeStorage(THEME_STORAGE_KEY, activeTheme);
}

export function initializeTheme() {
  const stored = readStorage(THEME_STORAGE_KEY);
  const preferred = window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  applyTheme(stored ?? document.documentElement.dataset.theme ?? preferred, false);
}

export function toggleTheme() {
  applyTheme(activeTheme === "dark" ? "light" : "dark", true);
}

export function themeName() {
  return activeTheme;
}

function cssNameFor(token) {
  return token.replace(/\./g, "-");
}

function paintColorTokens() {
  if (colorsCache === null) return;
  const root = document.documentElement;
  for (const row of colorsCache.tokens) {
    root.style.setProperty(`--${cssNameFor(row.name)}`, row[activeTheme] ?? row.light);
  }
}

async function fetchFirst(file) {
  for (const base of ICON_BASES) {
    try {
      const response = await fetch(`${base}/${file}`, { cache: "no-cache" });
      if (response.ok) return await response.json();
    } catch {
      // Base indisponível: tenta a próxima.
    }
  }
  return null;
}

export async function loadDesignTokens() {
  const [colors, iconsFile] = await Promise.all([
    fetchFirst("tokens/colors.json"),
    fetchFirst("tokens/icons.json"),
  ]);

  if (colors !== null) {
    colorsCache = colors;
    paintColorTokens();
  }
  if (iconsFile !== null) {
    icons = new Map(iconsFile.icons.map((icon) => [icon.name, icon]));
  }
  return { colors, icons: iconsFile };
}

export function phosphorIcon(name) {
  return icons.get(name)?.phosphor ?? "ph ph-file";
}

export function semanticColor(name) {
  const entry = icons.get(name);
  if (entry === undefined || colorsCache === null) return null;
  const row = colorsCache.tokens.find((candidate) => candidate.name === entry.color);
  return row === undefined ? null : (row[activeTheme] ?? row.light);
}