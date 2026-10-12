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

export type TargetFolderDialogState = {
  mode: "copy" | "move";
  sources: string[];
};

export type ViewerModalState =
  | { kind: "image"; entry: Entry }
  | { kind: "text"; entry: Entry; content: string; filetype: string }
  | { kind: "pdf"; entry: Entry; totalPages: number; initialPage: number };

export type UiState = {
  mode: UiMode;
  properties: Entry | undefined;
  inputDialog: InputDialogState | undefined;
  viewerModal: ViewerModalState | undefined;
  targetFolderDialog: TargetFolderDialogState | undefined;
  helpOpen: boolean;
  theme: ThemeName;
  locale: LocaleCode;
  iconSet: IconSet;
  sidebarVisible: boolean;
  sidebarWidth: number;
  previewVisible: boolean;
  previewWidth: number;
  splitPane: boolean;
  activePane: "left" | "right";
  splitRatio: number;
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
  openPdfViewer: (entry: Entry, totalPages: number, initialPage?: number) => void;
  closeViewer: () => void;
  openTargetFolderDialog: (mode: "copy" | "move", sources: string[]) => void;
  closeTargetFolderDialog: () => void;
  toggleHelp: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  toggleVisual: () => void;
  toggleSidebar: () => void;
  togglePreview: () => void;
  toggleSplitPane: () => void;
  switchPane: () => void;
  setActivePane: (pane: "left" | "right") => void;
  setSplitRatio: (ratio: number) => void;
  setSidebarWidth: (width: number) => void;
  setPreviewWidth: (width: number) => void;
  adjustSidebarWidth: (delta: number) => void;
  adjustPreviewWidth: (delta: number) => void;
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
    openPdfViewer(entry, totalPages, initialPage = 1) {
      setState("viewerModal", { kind: "pdf", entry, totalPages, initialPage });
    },
    closeViewer() {
      setState("viewerModal", undefined);
    },
    openTargetFolderDialog(mode, sources) {
      setState("targetFolderDialog", { mode, sources });
    },
    closeTargetFolderDialog() {
      setState("targetFolderDialog", undefined);
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
      if (!state.splitPane) {
        setState("activePane", "left");
      }
    },
    switchPane() {
      setState("activePane", (pane) => (pane === "left" ? "right" : "left"));
    },
    setActivePane(pane) {
      setState("activePane", pane);
    },
    setSplitRatio(ratio) {
      setState("splitRatio", Math.max(0.2, Math.min(0.8, ratio)));
    },
    setSidebarWidth(width) {
      setState("sidebarWidth", Math.max(12, Math.min(width, 60)));
    },
    setPreviewWidth(width) {
      setState("previewWidth", Math.max(20, Math.min(width, 80)));
    },
    adjustSidebarWidth(delta) {
      setState("sidebarWidth", (w) => Math.max(12, Math.min(w + delta, 60)));
    },
    adjustPreviewWidth(delta) {
      setState("previewWidth", (w) => Math.max(20, Math.min(w + delta, 80)));
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
