const LOCALES = ["pt-BR", "en-US"];
const LOCALES_BASE = "./i18n/";

let activeLocale = "pt-BR";
let dictionary = {};
const listeners = new Set();

async function loadDictionary(locale) {
  try {
    const response = await fetch(`${LOCALES_BASE}${locale}.json`, { cache: "no-cache" });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

function resolvePath(source, key) {
  let current = source;
  for (const segment of key.split(".")) {
    if (typeof current !== "object" || current === null) return undefined;
    current = current[segment];
  }
  return typeof current === "string" ? current : undefined;
}

export function t(key, fallback = key) {
  return resolvePath(dictionary, key) ?? fallback;
}

export function translate(key, params = {}) {
  return t(key, key).replace(/\{(\w+)\}/g, (match, token) =>
    params[token] === undefined ? match : String(params[token]),
  );
}

export function applyStaticTranslations(root = document) {
  for (const element of root.querySelectorAll("[data-i18n]")) {
    const value = resolvePath(dictionary, element.dataset.i18n);
    if (value !== undefined) element.textContent = value;
  }
  for (const element of root.querySelectorAll("[data-i18n-attr]")) {
    for (const pair of element.dataset.i18nAttr.split(",")) {
      const [attribute, key] = pair.split(":").map((part) => part.trim());
      const value = resolvePath(dictionary, key);
      if (value !== undefined) element.setAttribute(attribute, value);
    }
  }
}

export function locale() {
  return activeLocale;
}

export async function applyLocale(next, persist = true) {
  const loaded = await loadDictionary(next);
  if (loaded === null) return false;

  activeLocale = next;
  dictionary = loaded;
  document.documentElement.lang = next;
  applyStaticTranslations();
  if (persist) {
    try {
      localStorage.setItem("daisy-docs-locale", next);
    } catch {
      // Storage bloqueado: vale só para a sessão.
    }
  }
  for (const listener of listeners) listener(next);
  return true;
}

export function onLocaleChange(listener) {
  listeners.add(listener);
}

export async function initializeLocale() {
  let stored = null;
  try {
    stored = localStorage.getItem("daisy-docs-locale");
  } catch {
    stored = null;
  }
  await applyLocale(LOCALES.includes(stored) ? stored : "pt-BR", false);
  return activeLocale;
}

export const availableLocales = LOCALES;