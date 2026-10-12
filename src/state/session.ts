import { createStore, produce } from "solid-js/store";
import type { ViewMode } from "../core/config/schema";
import { type Entry, readDirectory } from "../core/entries/directory";
import { parentOf } from "../core/entries/path";
import { filterEntries, type SortOptions, sortEntries } from "../core/entries/sort";

export type SessionState = {
  cwd: string;
  entries: Entry[];
  cursor: number;
  marked: string[];
  query: string;
  showHidden: boolean;
  view: ViewMode;
  sort: SortOptions;
  loading: boolean;
  error: string | undefined;
};

export type SessionActions = {
  load: (path: string) => Promise<void>;
  setQuery: (query: string) => void;
  toggleHidden: () => void;
  toggleMarked: (path: string) => void;
  clearMarked: () => void;
  toggleView: () => void;
  setSort: (field: SortOptions["field"]) => void;
  moveCursor: (delta: number) => void;
  cursorTo: (index: number) => void;
  enter: () => Promise<void>;
  goUp: () => Promise<void>;
  clearError: () => void;
};

export type SessionStore = {
  state: SessionState;
  actions: SessionActions;
};

export function visibleEntries(state: SessionState): Entry[] {
  return sortEntries(filterEntries(state.entries, state.query, state.showHidden), state.sort);
}

export function clampCursor(entries: Entry[], cursor: number): number {
  if (entries.length === 0) return 0;
  return Math.max(0, Math.min(cursor, entries.length - 1));
}

export function createSessionStore(initial: SessionState): SessionStore {
  const [state, setState] = createStore<SessionState>(initial);

  async function load(path: string) {
    setState("loading", true);
    setState("error", undefined);
    try {
      const entries = await readDirectory(path);
      setState(
        produce((draft) => {
          draft.cwd = path;
          draft.entries = entries;
          draft.cursor = clampCursor(entries, draft.cursor);
        }),
      );
    } catch (error) {
      setState("error", String(error));
    } finally {
      setState("loading", false);
    }
  }

  const actions: SessionActions = {
    load,

    setQuery(query) {
      setState(
        produce((draft) => {
          draft.query = query;
          draft.cursor = 0;
        }),
      );
    },

    toggleHidden() {
      setState(
        produce((draft) => {
          draft.showHidden = !draft.showHidden;
          draft.cursor = clampCursor(visibleEntries(draft), draft.cursor);
        }),
      );
    },

    toggleMarked(path) {
      setState(
        produce((draft) => {
          const index = draft.marked.indexOf(path);
          if (index >= 0) draft.marked.splice(index, 1);
          else draft.marked.push(path);
        }),
      );
    },

    clearMarked() {
      setState("marked", []);
    },

    toggleView() {
      setState("view", (view) => (view === "list" ? "grid" : "list"));
    },

    setSort(field) {
      setState(
        produce((draft) => {
          draft.sort.descending = draft.sort.field === field ? !draft.sort.descending : false;
          draft.sort.field = field;
        }),
      );
    },

    moveCursor(delta) {
      setState("cursor", (cursor) => clampCursor(visibleEntries(state), cursor + delta));
    },

    cursorTo(index) {
      setState("cursor", () => clampCursor(visibleEntries(state), index));
    },

    async enter() {
      const target = visibleEntries(state)[state.cursor];
      if (target === undefined || !target.isDirectory) return;
      setState("cursor", 0);
      await load(target.path);
    },

    async goUp() {
      const parent = parentOf(state.cwd);
      if (parent === null) return;
      const previous = state.cwd;
      await load(parent);
      setState(
        produce((draft) => {
          const index = draft.entries.findIndex((entry) => entry.path === previous);
          draft.cursor = index >= 0 ? index : 0;
        }),
      );
    },

    clearError() {
      setState("error", undefined);
    },
  };

  return { state, actions };
}
