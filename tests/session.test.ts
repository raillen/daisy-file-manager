import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createTranslator } from "../src/core/i18n/translator";
import { defaultTheme, palettes } from "../src/core/theme/palette";
import { clampCursor, createSessionStore, type SessionState, visibleEntries } from "../src/state/session";
import { createUiStore } from "../src/state/ui";

let root = "";

function blankSession(cwd: string): SessionState {
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

function uiStore() {
  return createUiStore({
    initial: {
      mode: "normal",
      properties: undefined,
      inputDialog: undefined,
      viewerModal: undefined,
      helpOpen: false,
      theme: defaultTheme,
      locale: "pt-BR",
      iconSet: "unicode",
      sidebarVisible: true,
      previewVisible: true,
      splitPane: false,
      quit: false,
    },
    translators: { "pt-BR": createTranslator("pt-BR"), "en-US": createTranslator("en-US") },
    palettes,
  });
}

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "daisy-session-"));
  await mkdir(join(root, "alpha"), { recursive: true });
  await mkdir(join(root, "beta"), { recursive: true });
  await writeFile(join(root, "gamma.txt"), "g", "utf8");
  await writeFile(join(root, ".oculto"), "o", "utf8");
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

describe("clampCursor", () => {
  test("mantém dentro dos limites", () => {
    expect(clampCursor([], 5)).toBe(0);
    expect(clampCursor([{ name: "a" } as never], 5)).toBe(0);
    expect(clampCursor([{ name: "a" } as never, { name: "b" } as never], -3)).toBe(0);
  });
});

describe("visibleEntries", () => {
  test("ordena e filtra", async () => {
    const session = createSessionStore(blankSession(root));
    await session.actions.load(root);

    const names = visibleEntries(session.state).map((entry) => entry.name);
    expect(names).toEqual(["alpha", "beta", "gamma.txt"]);

    session.actions.setQuery("bt");
    expect(visibleEntries(session.state).map((entry) => entry.name)).toEqual(["beta"]);
  });
});

describe("store de sessão", () => {
  test("moveCursor respeita a lista visível", async () => {
    const session = createSessionStore(blankSession(root));
    await session.actions.load(root);

    session.actions.moveCursor(2);
    expect(session.state.cursor).toBe(2);

    session.actions.moveCursor(-10);
    expect(session.state.cursor).toBe(0);
  });

  test("toggleHidden alterna ocultos", async () => {
    const session = createSessionStore(blankSession(root));
    await session.actions.load(root);

    expect(visibleEntries(session.state).length).toBe(3);
    session.actions.toggleHidden();
    expect(visibleEntries(session.state).length).toBe(4);
  });

  test("toggleMarked marca e desmarca", async () => {
    const session = createSessionStore(blankSession(root));
    await session.actions.load(root);
    const path = visibleEntries(session.state)[0]?.path;
    expect(path).toBeDefined();
    if (path === undefined) return;

    session.actions.toggleMarked(path);
    expect(session.state.marked).toEqual([path]);

    session.actions.toggleMarked(path);
    expect(session.state.marked).toEqual([]);
  });

  test("toggleView alterna lista e grade", async () => {
    const session = createSessionStore(blankSession(root));
    expect(session.state.view).toBe("list");
    session.actions.toggleView();
    expect(session.state.view).toBe("grid");
  });

  test("enter entra em diretório", async () => {
    const session = createSessionStore(blankSession(root));
    await session.actions.load(root);

    session.actions.cursorTo(0);
    await session.actions.enter();

    expect(session.state.cwd).toBe(join(root, "alpha"));
    expect(visibleEntries(session.state)).toEqual([]);
  });

  test("goUp volta ao pai mantendo o cursor na pasta de origem", async () => {
    const session = createSessionStore(blankSession(root));
    await session.actions.load(root);
    await session.actions.enter();
    expect(session.state.cwd).toBe(join(root, "alpha"));

    await session.actions.goUp();
    expect(session.state.cwd).toBe(root);
    const names = visibleEntries(session.state).map((entry) => entry.name);
    expect(names[names.indexOf("alpha")]).toBe("alpha");
  });

  test("load registra erro em caminho inexistente", async () => {
    const session = createSessionStore(blankSession(root));
    await session.actions.load(join(root, "nao-existe"));

    expect(session.state.error).toBeDefined();
    expect(session.state.loading).toBe(false);
  });
});

describe("store de ui", () => {
  test("alterna tema, painéis e idioma", () => {
    const ui = uiStore();

    ui.actions.toggleTheme();
    expect(ui.state.theme).toBe("light");
    ui.actions.toggleTheme();
    expect(ui.state.theme).toBe("dark");

    const sidebarBefore = ui.state.sidebarVisible;
    ui.actions.toggleSidebar();
    expect(ui.state.sidebarVisible).toBe(!sidebarBefore);

    ui.actions.setLocale("en-US");
    expect(ui.translate("places.home")).toBe("Home");

    ui.actions.openInputDialog({ kind: "mkdir", initialValue: "teste" });
    expect(ui.state.inputDialog?.kind).toBe("mkdir");
    expect(ui.state.inputDialog?.initialValue).toBe("teste");
    ui.actions.closeInputDialog();
    expect(ui.state.inputDialog).toBeUndefined();

    ui.actions.openCommandLine();
    expect(ui.state.mode).toBe("command");
    ui.actions.closeCommandLine();
    expect(ui.state.mode).toBe("normal");
  });
});
