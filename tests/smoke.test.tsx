import { expect, test } from "bun:test";

import { testRender } from "@opentui/solid";

import { App } from "../src/app/App";
import { createTranslator } from "../src/core/i18n/translator";
import { defaultTheme, palettes } from "../src/core/theme/palette";
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

  const setup = await testRender(() => (
    <App session={session} ui={ui} places={[]} home={cwd} separator="/" freeSpace={undefined} />
  ));
  await setup.renderOnce();

  const frame = setup.captureCharFrame();
  expect(frame).toContain("daisy");
  expect(setup.renderer).toBeTruthy();

  await setup.dispose();
});
