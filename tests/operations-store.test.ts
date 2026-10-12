import { describe, expect, test } from "bun:test";
import { readDirectory } from "../src/core/entries/directory";
import { selectedPaths } from "../src/state/operations";
import { createSessionStore, type SessionState } from "../src/state/session";

function sessionWith(entries: { name: string; path: string; isDirectory: boolean }[]) {
  const state: SessionState = {
    cwd: "/tmp",
    entries: entries as SessionState["entries"],
    cursor: 0,
    marked: [],
    query: "",
    showHidden: false,
    view: "list",
    sort: { field: "name", descending: false, directoriesFirst: true },
    loading: false,
    error: undefined,
  };
  return createSessionStore(state);
}

describe("selectedPaths", () => {
  test("usa itens marcados quando existem", () => {
    const session = sessionWith([
      { name: "a", path: "/tmp/a", isDirectory: false },
      { name: "b", path: "/tmp/b", isDirectory: false },
    ]);
    session.actions.toggleMarked("/tmp/a");
    session.actions.toggleMarked("/tmp/b");

    expect(selectedPaths(session)).toEqual(["/tmp/a", "/tmp/b"]);
  });

  test("cai para o item do cursor sem marcacao", () => {
    const session = sessionWith([
      { name: "a", path: "/tmp/a", isDirectory: false },
      { name: "b", path: "/tmp/b", isDirectory: false },
    ]);
    session.actions.cursorTo(1);

    expect(selectedPaths(session)).toEqual(["/tmp/b"]);
  });

  test("lista vazia retorna vazio", () => {
    expect(selectedPaths(sessionWith([]))).toEqual([]);
  });
});

describe("selectedPaths com entradas reais", () => {
  test("lê do disco e devolve caminho absoluto", async () => {
    const entries = await readDirectory(process.cwd());
    const session = sessionWith(
      entries.map((entry) => ({ name: entry.name, path: entry.path, isDirectory: entry.isDirectory })),
    );

    const paths = selectedPaths(session);
    expect(paths).toHaveLength(1);
    expect(paths[0]?.startsWith("/")).toBe(true);
  });
});

describe("clipboard com múltiplos arquivos", () => {
  test("armazena e limpa múltiplos caminhos em modo copy e cut", () => {
    const session = sessionWith([
      { name: "a", path: "/tmp/a", isDirectory: false },
      { name: "b", path: "/tmp/b", isDirectory: false },
      { name: "c", path: "/tmp/c", isDirectory: false },
    ]);

    session.actions.extendSelection(2);
    const paths = selectedPaths(session);
    expect(paths).toHaveLength(3);

    const clipboard = {
      state: { mode: "copy" as "copy" | "cut", paths: [] as string[] },
      set(mode: "copy" | "cut", p: string[]) {
        this.state.mode = mode;
        this.state.paths = p;
      },
    };

    clipboard.set("cut", paths);
    expect(clipboard.state.mode).toBe("cut");
    expect(clipboard.state.paths).toEqual(["/tmp/a", "/tmp/b", "/tmp/c"]);

    clipboard.set("copy", paths);
    expect(clipboard.state.mode).toBe("copy");
    expect(clipboard.state.paths).toEqual(["/tmp/a", "/tmp/b", "/tmp/c"]);
  });
});
