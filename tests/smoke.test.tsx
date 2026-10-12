import { expect, test } from "bun:test";

import { createDefaultOpenTuiKeymap } from "@opentui/keymap/opentui";
import { KeymapProvider } from "@opentui/keymap/solid";
import { testRender, useRenderer } from "@opentui/solid";

import { App } from "../src/app/App";
import { useCommandLayer } from "../src/commands/useCommandLayer";
import { createTranslator } from "../src/core/i18n/translator";
import { createPreviewCache } from "../src/core/preview/cache";
import { defaultTheme, palettes } from "../src/core/theme/palette";
import { createClipboardStore, createQueueStore } from "../src/state/operations";
import { createSessionStore, type SessionState } from "../src/state/session";
import { createUiStore, type UiState } from "../src/state/ui";

function emptySession(cwd: string): SessionState {
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

function testStores(cwd: string) {
  const session = createSessionStore(emptySession(cwd));
  const ui = createUiStore({
    initial: {
      mode: "normal",
      properties: undefined,
      inputDialog: undefined,
      helpOpen: false,
      theme: defaultTheme,
      locale: "pt-BR",
      iconSet: "unicode",
      sidebarVisible: true,
      previewVisible: true,
      splitPane: false,
      quit: false,
    } as UiState,
    translators: { "pt-BR": createTranslator("pt-BR"), "en-US": createTranslator("en-US") },
    palettes,
  });
  return { session, ui };
}

test("App renders headlessly", async () => {
  const cwd = process.cwd();
  const { session, ui } = testStores(cwd);
  await session.actions.load(cwd);

  const previewCache = createPreviewCache({ maxTextBytes: 1024 });
  const clipboard = createClipboardStore();
  const queue = createQueueStore();

  const setup = await testRender(() => (
    <App
      keymapOverrides={{}}
      previewCache={previewCache}
      clipboard={clipboard}
      queue={queue}
      session={session}
      ui={ui}
      places={[]}
      home={cwd}
      separator="/"
      freeSpace={undefined}
    />
  ));
  await setup.renderOnce();

  const frame = setup.captureCharFrame();
  expect(frame).toContain("daisy");
  expect(setup.renderer).toBeTruthy();

  await setup.dispose();
});

test("App with KeymapProvider and useCommandLayer mounts cleanly", async () => {
  const cwd = process.cwd();
  const { session, ui } = testStores(cwd);
  await session.actions.load(cwd);

  const previewCache = createPreviewCache({ maxTextBytes: 1024 });
  const clipboard = createClipboardStore();
  const queue = createQueueStore();

  function RootWrapper() {
    const renderer = useRenderer();
    const keymap = createDefaultOpenTuiKeymap(renderer);

    function Inner() {
      useCommandLayer({
        session,
        ui,
        clipboard,
        queue,
        currentEntryPath: () => undefined,
        onQuit: () => {},
      });
      return (
        <App
          keymapOverrides={{}}
          previewCache={previewCache}
          clipboard={clipboard}
          queue={queue}
          session={session}
          ui={ui}
          places={[]}
          home={cwd}
          separator="/"
          freeSpace={undefined}
        />
      );
    }

    return (
      <KeymapProvider keymap={keymap}>
        <Inner />
      </KeymapProvider>
    );
  }

  const setup = await testRender(() => <RootWrapper />);
  await setup.renderOnce();
  const frame = setup.captureCharFrame();
  expect(frame).toContain("daisy");
  await setup.dispose();
});
