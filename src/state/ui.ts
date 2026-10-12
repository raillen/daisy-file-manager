import { createStore } from "solid-js/store";

import type { Entry } from "../core/entries/directory";
import type { LocaleCode, Translator } from "../core/i18n/translator";
import type { IconSet } from "../core/theme/icons";
import type { Palette, ThemeName } from "../core/theme/palette";

export type UiMode = "normal" | "search" | "visual" | "command";

export type InputDialogKind = "mkdir" | "rename" | "newFile";

export type InputDialogState = {
  kind: InputDialogKind;
  initialValue: string;
  targetPath?: string;
};

export type ViewerModalState =
  | { kind: "image"; entry: Entry }
  | { kind: "text"; entry: Entry; content: string; filetype: string };

export type UiState = {
  mode: UiMode;
  properties: Entry | undefined;
  inputDialog: InputDialogState | undefined;
  viewerModal: ViewerModalState | undefined;
  helpOpen: boolean;
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
  showProperties: (entry: Entry) => void;
  hideProperties: () => void;
  openInputDialog: (dialog: InputDialogState) => void;
  closeInputDialog: () => void;
  openCommandLine: () => void;
  closeCommandLine: () => void;
  openImageViewer: (entry: Entry) => void;
  openTextViewer: (entry: Entry, content: string, filetype: string) => void;
  closeViewer: () => void;
  toggleHelp: () => void;
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
    showProperties(entry) {
      setState("properties", entry);
    },
    hideProperties() {
      setState("properties", undefined);
    },
    openInputDialog(dialog) {
      setState("inputDialog", dialog);
    },
    closeInputDialog() {
      setState("inputDialog", undefined);
    },
    openCommandLine() {
      setState("mode", "command");
    },
    closeCommandLine() {
      setState("mode", "normal");
    },
    openImageViewer(entry) {
      setState("viewerModal", { kind: "image", entry });
    },
    openTextViewer(entry, content, filetype) {
      setState("viewerModal", { kind: "text", entry, content, filetype });
    },
    closeViewer() {
      setState("viewerModal", undefined);
    },
    toggleHelp() {
      setState("helpOpen", (open) => !open);
    },
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
