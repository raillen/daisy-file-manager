const STORAGE_THEME = "daisy-docs-theme";
const STORAGE_LOCALE = "daisy-docs-locale";
const TOKEN_BASES = ["../design", "./design"];

export const config = {
  manifestUrl: "./docs/manifest.json",
  docsBase: "./docs/",
  storage: { theme: STORAGE_THEME, locale: STORAGE_LOCALE },
  tokenBases: TOKEN_BASES,
  defaultRoute: "#/docs/home.md",
};

export const dom = {
  content: document.querySelector("#content"),
  nav: document.querySelector("#docNav"),
  pageToc: document.querySelector("#pageToc"),
  search: document.querySelector("#search"),
  searchResults: document.querySelector("#searchResults"),
  sidebar: document.querySelector("#sidebar"),
  sidebarBackdrop: document.querySelector("#sidebarBackdrop"),
  collapseAll: document.querySelector("#collapseAll"),
  themeToggle: document.querySelector("#themeToggle"),
  menuToggle: document.querySelector("#menuToggle"),
  localeSelect: document.querySelector("#localeSelect"),
};