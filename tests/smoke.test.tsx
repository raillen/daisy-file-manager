import { expect, test } from "bun:test";

import { testRender } from "@opentui/solid";

import { App } from "../src/app/App";
import { createTranslator } from "../src/core/i18n/translator";
import { createPreviewCache } from "../src/core/preview/cache";
import { defaultTheme, palettes } from "../src/core/theme/palette";
import { createQueueStore } from "../src/state/operations";
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
  const queue = createQueueStore();

  const setup = await testRender(() => (
    <App
      keymapOverrides={{}}
      previewCache={previewCache}
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
