import type { Command } from "@opentui/keymap";
import { useBindings, useKeymap } from "@opentui/keymap/solid";
import { createEffect } from "solid-js";

import { openExternally } from "../core/operations/system";
import type { ClipboardStore, QueueStore } from "../state/operations";
import { pasteInto, selectedPaths, trashSelection } from "../state/operations";
import { type SessionStore, visibleEntries } from "../state/session";
import type { UiStore } from "../state/ui";

import { type BindingOverrides, buildBindings } from "./bindings";

export type CommandRuntime = {
  session: SessionStore;
  ui: UiStore;
  clipboard: ClipboardStore;
  queue: QueueStore;
  currentEntryPath: () => string | undefined;
  onQuit: () => void;
  onExitSearch?: () => void;
  overrides?: BindingOverrides;
};

function commandsFor(runtime: CommandRuntime): Command[] {
  const { session, ui, clipboard, queue } = runtime;
  const reload = () => session.actions.load(session.state.cwd);

  const deps = { session, clipboard, queue, translate: ui.translate, reload };

  return [
    { name: "nav.down", run: () => session.actions.moveCursor(1) },
    { name: "nav.up", run: () => session.actions.moveCursor(-1) },
    { name: "nav.first", run: () => session.actions.cursorTo(0) },
    { name: "nav.last", run: () => session.actions.cursorTo(Number.MAX_SAFE_INTEGER) },
    { name: "nav.enter", run: () => void session.actions.enter() },
    { name: "nav.parent", run: () => void session.actions.goUp() },

    { name: "select.toggle", run: () => toggleMarked(runtime) },
    { name: "select.visual", run: ui.actions.toggleVisual },

    { name: "file.yank", run: () => copySelection(runtime, "copy") },
    { name: "file.cut", run: () => copySelection(runtime, "cut") },
    { name: "file.paste", run: () => void pasteInto(deps, session.state.cwd) },
    { name: "file.trash", run: () => void trashSelection(deps, selectedPaths(session)) },
    { name: "file.open", run: () => openCurrent(runtime) },
    { name: "file.properties", run: () => toggleProperties(runtime) },

    { name: "ui.search", run: () => openSearch(runtime) },
    { name: "ui.escape", run: () => closeSearch(runtime) },
    { name: "ui.clear", run: () => session.actions.setQuery("") },

    { name: "view.toggle", run: session.actions.toggleView },
    { name: "view.hidden", run: session.actions.toggleHidden },
    { name: "view.splitPane", run: ui.actions.toggleSplitPane },
    { name: "view.sidebar", run: ui.actions.toggleSidebar },
    { name: "view.preview", run: ui.actions.togglePreview },
    { name: "view.help", run: () => {} },
    { name: "view.sort.name", run: () => session.actions.setSort("name") },
    { name: "view.sort.size", run: () => session.actions.setSort("size") },
    { name: "view.sort.modified", run: () => session.actions.setSort("modified") },

    { name: "ui.quit", run: runtime.onQuit },
  ];
}

function toggleMarked(runtime: CommandRuntime) {
  const path = runtime.currentEntryPath();
  if (path === undefined) return;
  runtime.session.actions.toggleMarked(path);
  runtime.session.actions.moveCursor(1);
}

function copySelection(runtime: CommandRuntime, mode: "copy" | "cut") {
  const paths = selectedPaths(runtime.session);
  if (paths.length === 0) return;
  runtime.clipboard.actions.set(mode, paths);
  runtime.queue.actions.succeed(
    runtime.ui.translate(mode === "copy" ? "operation.copy.started" : "operation.move.started", {
      count: paths.length,
    }),
  );
}

function toggleProperties(runtime: CommandRuntime) {
  const current = runtime.currentEntryPath();
  if (current === undefined) return;

  if (runtime.ui.state.properties !== undefined) {
    runtime.ui.actions.hideProperties();
    return;
  }

  const entry = visibleEntries(runtime.session.state).find((item) => item.path === current);
  if (entry === undefined) return;
  runtime.ui.actions.showProperties(entry);
}

function openCurrent(runtime: CommandRuntime) {
  const path = runtime.currentEntryPath();
  if (path === undefined) return;
  openExternally(path);
}

function openSearch(runtime: CommandRuntime) {
  if (runtime.ui.state.mode === "search") return;
  runtime.ui.actions.openSearch();
}

function closeSearch(runtime: CommandRuntime) {
  if (runtime.ui.state.mode !== "search") return;
  runtime.session.actions.setQuery("");
  runtime.ui.actions.closeSearch();
  runtime.onExitSearch?.();
}

export function useCommandLayer(runtime: CommandRuntime) {
  const keymap = useKeymap();

  useBindings(() => ({
    name: "app",
    priority: 0,
    commands: commandsFor(runtime),
    bindings: buildBindings(runtime.overrides),
  }));

  createEffect(() => {
    if (runtime.ui.state.quit) runtime.onQuit();
  });

  return keymap;
}
