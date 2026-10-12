import { statfs } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

import { createDefaultOpenTuiKeymap } from "@opentui/keymap/opentui";
import { KeymapProvider } from "@opentui/keymap/solid";
import { render, useRenderer } from "@opentui/solid";
import { createEffect, onCleanup } from "solid-js";

import { App } from "./app/App";
import type { Place } from "./app/Sidebar";
import { useCommandLayer } from "./commands/useCommandLayer";
import { loadConfig } from "./core/config/loader";
import { createTranslator, type LocaleCode, type Translator } from "./core/i18n/translator";
import type { PreviewCache } from "./core/preview/cache";
import { createPreviewCache } from "./core/preview/cache";
import { glyph, type IconSet } from "./core/theme/icons";
import { palettes, type ThemeName } from "./core/theme/palette";
import { createDirectoryWatcher } from "./core/watch/watcher";
import { type ClipboardStore, createClipboardStore, createQueueStore, type QueueStore } from "./state/operations";
import { createSessionStore, type SessionState, visibleEntries } from "./state/session";
import { createUiStore, type UiState } from "./state/ui";

async function freeSpaceOf(path: string): Promise<number | undefined> {
  try {
    const stats = await statfs(path);
    return stats.bsize * stats.bavail;
  } catch {
    return undefined;
  }
}

function translatorsFor(): Record<LocaleCode, Translator> {
  return {
    "pt-BR": createTranslator("pt-BR"),
    "en-US": createTranslator("en-US"),
  };
}

function initialSession(cwd: string): SessionState {
  return {
    cwd,
    entries: [],
    cursor: 0,
    marked: [],
    query: "",
    showHidden: false,
    view: "list",
    sort: { field: "name", descending: false, directoriesFirst: true },
    loading: false,
    error: undefined,
  };
}

function initialUi(theme: ThemeName, locale: LocaleCode, iconSet: IconSet, splitPane: boolean): UiState {
  return {
    mode: "normal",
    properties: undefined,
    helpOpen: false,
    theme,
    locale,
    iconSet,
    sidebarVisible: true,
    previewVisible: true,
    splitPane,
    quit: false,
  };
}

function buildPlaces(home: string, t: Translator): Place[] {
  return [
    { key: "home", icon: "ui.home", label: t("places.home"), path: home },
    { key: "documents", icon: "ui.documents", label: t("places.documents"), path: join(home, "Documents") },
    { key: "downloads", icon: "ui.downloads", label: t("places.downloads"), path: join(home, "Downloads") },
    { key: "pictures", icon: "ui.pictures", label: t("places.pictures"), path: join(home, "Pictures") },
    { key: "music", icon: "ui.music", label: t("places.music"), path: join(home, "Music") },
    { key: "videos", icon: "ui.videos", label: t("places.videos"), path: join(home, "Videos") },
  ];
}

function Root(props: {
  previewCache: PreviewCache;
  clipboard: ClipboardStore;
  queue: QueueStore;
  session: ReturnType<typeof createSessionStore>;
  ui: ReturnType<typeof createUiStore>;
  places: Place[];
  home: string;
  freeSpace: number | undefined;
  keymapOverrides: Record<string, string[]>;
}) {
  const renderer = useRenderer();
  const keymap = createDefaultOpenTuiKeymap(renderer);

  createEffect(() => {
    const directory = props.session.state.cwd;
    const watcher = createDirectoryWatcher(() => {
      void props.session.actions.load(directory);
    });

    void watcher.watch(directory);
    onCleanup(() => void watcher.close());
  });

  useCommandLayer({
    session: props.session,
    ui: props.ui,
    clipboard: props.clipboard,
    queue: props.queue,
    currentEntryPath: () => visibleEntries(props.session.state)[props.session.state.cursor]?.path,
    overrides: props.keymapOverrides,
    onQuit: () => props.ui.actions.quit(),
  });

  return (
    <KeymapProvider keymap={keymap}>
      <App
        keymapOverrides={props.keymapOverrides}
        previewCache={props.previewCache}
        queue={props.queue}
        session={props.session}
        ui={props.ui}
        places={props.places}
        home={props.home}
        separator={glyph("nav.expand", props.ui.state.iconSet)}
        freeSpace={props.freeSpace}
      />
    </KeymapProvider>
  );
}

const { config, warnings } = await loadConfig();
const home = homedir();
const startDirectory = process.cwd();

for (const warning of warnings) console.error(`[daisy] ${warning}`);

const translators = translatorsFor();
const session = createSessionStore(initialSession(startDirectory));
const ui = createUiStore({
  initial: initialUi(config.theme, config.locale, config.iconSet, config.splitPane),
  translators,
  palettes,
});
const places = buildPlaces(home, translators[config.locale]);
const previewCache = createPreviewCache({ maxTextBytes: config.preview.maxTextBytes });
const clipboard = createClipboardStore();
const queue = createQueueStore();

await session.actions.load(startDirectory);
const freeSpace = await freeSpaceOf(startDirectory);

await render(
  () => (
    <Root
      previewCache={previewCache}
      clipboard={clipboard}
      queue={queue}
      session={session}
      ui={ui}
      places={places}
      home={home}
      freeSpace={freeSpace}
      keymapOverrides={config.keymap}
    />
  ),
  {
    exitOnCtrlC: false,
  },
);
