import type { Command } from "@opentui/keymap";

import { useBindings, useKeymap } from "@opentui/keymap/solid";
import { createEffect } from "solid-js";

import type { SessionStore } from "../state/session";
import type { UiStore } from "../state/ui";

import { type BindingOverrides, buildBindings } from "./bindings";

export type CommandRuntime = {
  session: SessionStore;
  ui: UiStore;
  currentEntryPath: () => string | undefined;
  onQuit: () => void;
  overrides?: BindingOverrides;
};

function commandsFor(runtime: CommandRuntime): Command[] {
  const { session, ui } = runtime;

  return [
    { name: "nav.down", run: () => session.actions.moveCursor(1) },
    { name: "nav.up", run: () => session.actions.moveCursor(-1) },
    { name: "nav.first", run: () => session.actions.cursorTo(0) },
    { name: "nav.last", run: () => session.actions.cursorTo(Number.MAX_SAFE_INTEGER) },
    { name: "nav.enter", run: () => void session.actions.enter() },
    { name: "nav.parent", run: () => void session.actions.goUp() },
    { name: "select.toggle", run: () => toggleMarked(runtime) },
    { name: "view.toggle", run: session.actions.toggleView },
    { name: "view.hidden", run: session.actions.toggleHidden },
    { name: "view.splitPane", run: ui.actions.toggleSplitPane },
    { name: "view.sidebar", run: ui.actions.toggleSidebar },
    { name: "view.preview", run: ui.actions.togglePreview },
    { name: "view.help", run: () => {} },
    { name: "ui.quit", run: runtime.onQuit },
  ];
}

function toggleMarked(runtime: CommandRuntime) {
  const path = runtime.currentEntryPath();
  if (path === undefined) return;
  runtime.session.actions.toggleMarked(path);
  runtime.session.actions.moveCursor(1);
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
