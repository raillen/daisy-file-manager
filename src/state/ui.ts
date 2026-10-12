import { createStore } from "solid-js/store";

import type { LocaleCode, Translator } from "../core/i18n/translator";
import type { IconSet } from "../core/theme/icons";
import type { Palette, ThemeName } from "../core/theme/palette";

export type UiMode = "normal" | "search" | "visual";

export type UiState = {
  mode: UiMode;
  theme: ThemeName;
  locale: LocaleCode;
  iconSet: IconSet;
  sidebarVisible: boolean;
  previewVisible: boolean;
  splitPane: boolean;
  quit: boolean;
};

export type UiActions = {
  setMode: (mode: UiMode) => void;
  openSearch: () => void;
  closeSearch: () => void;
  toggleVisual: () => void;
  toggleSidebar: () => void;
  togglePreview: () => void;
  toggleSplitPane: () => void;
  toggleTheme: () => void;
  setLocale: (locale: LocaleCode) => void;
  quit: () => void;
};

export type UiStore = {
  state: UiState;
  actions: UiActions;
  translate: Translator;
  palette: () => Palette;
};

export type UiStoreInput = {
  initial: UiState;
  translators: Record<LocaleCode, Translator>;
  palettes: Record<ThemeName, Palette>;
};

export function createUiStore({ initial, translators, palettes }: UiStoreInput): UiStore {
  const [state, setState] = createStore<UiState>(initial);

  const actions: UiActions = {
    setMode(mode) {
      setState("mode", mode);
    },
    openSearch() {
      setState("mode", "search");
    },
    closeSearch() {
      setState("mode", "normal");
    },
    toggleVisual() {
      setState("mode", (mode) => (mode === "visual" ? "normal" : "visual"));
    },
    toggleSidebar() {
      setState("sidebarVisible", (visible) => !visible);
    },
    togglePreview() {
      setState("previewVisible", (visible) => !visible);
    },
    toggleSplitPane() {
      setState("splitPane", (enabled) => !enabled);
    },
    toggleTheme() {
      setState("theme", (theme) => (theme === "dark" ? "light" : "dark"));
    },
    setLocale(locale) {
      setState("locale", locale);
    },
    quit() {
      setState("quit", true);
    },
  };

  const translate: Translator = (key, params) => translators[state.locale](key, params);

  return {
    state,
    actions,
    translate,
    palette: () => palettes[state.theme],
  };
}
