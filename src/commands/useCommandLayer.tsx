import { basename } from "node:path";

import type { Command } from "@opentui/keymap";
import { useBindings, useKeymap } from "@opentui/keymap/solid";
import { createEffect } from "solid-js";

import { extractArchive, isArchive } from "../core/operations/archive";
import { openExternally } from "../core/operations/system";
import type { PreviewCache } from "../core/preview/cache";
import type { ClipboardStore, QueueStore } from "../state/operations";
import { pasteInto, selectedPaths, trashSelection } from "../state/operations";
import { type SessionStore, visibleEntries } from "../state/session";
import type { UiStore } from "../state/ui";

import { type BindingOverrides, buildBindings } from "./bindings";

export type CommandRuntime = {
  session: SessionStore;
  activeSession?: () => SessionStore;
  onSwitchPane?: () => void;
  ui: UiStore;
  clipboard: ClipboardStore;
  queue: QueueStore;
  previewCache?: PreviewCache;
  currentEntryPath: () => string | undefined;
  onQuit: () => void;
  onExitSearch?: () => void;
  overrides?: BindingOverrides;
};

function commandsFor(runtime: CommandRuntime): Command[] {
  const { ui, clipboard, queue } = runtime;
  const curSession = () => runtime.activeSession?.() ?? runtime.session;
  const reload = () => curSession().actions.load(curSession().state.cwd);

  const deps = {
    get session() {
      return curSession();
    },
    clipboard,
    queue,
    translate: ui.translate,
    reload,
  };

  return [
    { name: "nav.down", run: () => curSession().actions.moveCursor(1) },
    { name: "nav.up", run: () => curSession().actions.moveCursor(-1) },
    { name: "nav.first", run: () => curSession().actions.cursorTo(0) },
    { name: "nav.last", run: () => curSession().actions.cursorTo(Number.MAX_SAFE_INTEGER) },
    { name: "nav.enter", run: () => void handleEnter(runtime) },
    { name: "nav.parent", run: () => void curSession().actions.goUp() },

    { name: "select.toggle", run: () => toggleMarked(runtime) },
    { name: "select.visual", run: ui.actions.toggleVisual },
    { name: "select.down", run: () => curSession().actions.extendSelection(1) },
    { name: "select.up", run: () => curSession().actions.extendSelection(-1) },
    { name: "select.all", run: () => curSession().actions.selectAll() },

    { name: "file.yank", run: () => copySelection(runtime, "copy") },
    { name: "file.cut", run: () => copySelection(runtime, "cut") },
    { name: "file.paste", run: () => void pasteInto(deps, curSession().state.cwd) },
    { name: "file.copyTo", run: () => openCopyTo(runtime) },
    { name: "file.moveTo", run: () => openMoveTo(runtime) },
    { name: "file.trash", run: () => void trashSelection(deps, selectedPaths(curSession())) },
    { name: "file.open", run: () => openCurrent(runtime) },
    { name: "file.properties", run: () => toggleProperties(runtime) },
    { name: "file.mkdir", run: () => openMkdir(runtime) },
    { name: "file.rename", run: () => openRename(runtime) },
    { name: "file.newFile", run: () => openNewFile(runtime) },
    { name: "file.extract", run: () => void extractSelection(runtime) },
    { name: "action.bookmark", run: () => toggleBookmarkCurrent(runtime) },
    { name: "panel.sidebarDec", run: () => runtime.ui.actions.adjustSidebarWidth(-2) },
    { name: "panel.sidebarInc", run: () => runtime.ui.actions.adjustSidebarWidth(2) },
    { name: "panel.previewDec", run: () => runtime.ui.actions.adjustPreviewWidth(-4) },
    { name: "panel.previewInc", run: () => runtime.ui.actions.adjustPreviewWidth(4) },
    { name: "panel.switchPane", run: () => runtime.onSwitchPane?.() },

    { name: "ui.commandLine", run: () => runtime.ui.actions.openCommandLine() },
    { name: "ui.search", run: () => openSearch(runtime) },
    { name: "ui.escape", run: () => handleEscape(runtime) },
    { name: "ui.clear", run: () => curSession().actions.setQuery("") },

    { name: "view.toggle", run: () => curSession().actions.toggleView() },
    { name: "view.hidden", run: () => curSession().actions.toggleHidden() },
    { name: "view.splitPane", run: ui.actions.toggleSplitPane },
    { name: "view.sidebar", run: ui.actions.toggleSidebar },
    { name: "view.preview", run: ui.actions.togglePreview },
    { name: "view.help", run: ui.actions.toggleHelp },
    { name: "view.sort.name", run: () => curSession().actions.setSort("name") },
    { name: "view.sort.size", run: () => curSession().actions.setSort("size") },
    { name: "view.sort.modified", run: () => curSession().actions.setSort("modified") },

    { name: "ui.quit", run: runtime.onQuit },
  ];
}

async function handleEnter(runtime: CommandRuntime) {
  const current = runtime.currentEntryPath();
  if (current === undefined) return;
  const cur = runtime.activeSession?.() ?? runtime.session;
  const entry = visibleEntries(cur.state).find((item) => item.path === current);
  if (entry === undefined) return;

  if (entry.isDirectory) {
    await cur.actions.enter();
    return;
  }

  if (isArchive(entry.name)) {
    await extractSelection(runtime);
    return;
  }

  if (runtime.previewCache) {
    const preview = await runtime.previewCache.get(entry);
    if (preview.kind === "image") {
      runtime.ui.actions.openImageViewer(entry);
      return;
    }
    if (preview.kind === "text") {
      runtime.ui.actions.openTextViewer(entry, preview.content, preview.filetype);
      return;
    }
    if (preview.kind === "pdf") {
      runtime.ui.actions.openPdfViewer(entry, preview.pdfPages ?? 1);
      return;
    }
  }

  openExternally(entry.path);
}

async function extractSelection(runtime: CommandRuntime) {
  const cur = runtime.activeSession?.() ?? runtime.session;
  const paths = selectedPaths(cur);
  const archives = paths.filter((path) => isArchive(path));
  if (archives.length === 0) return;

  for (const archive of archives) {
    const name = basename(archive);
    runtime.queue.actions.succeed(runtime.ui.translate("operation.extract.started", { name }));
    const result = await extractArchive(archive);
    if (result.success) {
      runtime.queue.actions.succeed(runtime.ui.translate("operation.extract.done"));
    } else {
      runtime.queue.actions.fail(runtime.ui.translate("operation.extract.failed", { name }));
    }
  }
  await cur.actions.load(cur.state.cwd);
}

function openMkdir(runtime: CommandRuntime) {
  runtime.ui.actions.openInputDialog({
    kind: "mkdir",
    initialValue: "",
  });
}

function openRename(runtime: CommandRuntime) {
  const current = runtime.currentEntryPath();
  if (current === undefined) return;
  const cur = runtime.activeSession?.() ?? runtime.session;
  const entry = visibleEntries(cur.state).find((item) => item.path === current);
  if (entry === undefined) return;

  runtime.ui.actions.openInputDialog({
    kind: "rename",
    initialValue: entry.name,
    targetPath: entry.path,
  });
}

function openNewFile(runtime: CommandRuntime) {
  runtime.ui.actions.openInputDialog({
    kind: "newFile",
    initialValue: "",
  });
}

function openCopyTo(runtime: CommandRuntime) {
  const cur = runtime.activeSession?.() ?? runtime.session;
  const selected = selectedPaths(cur);
  const paths = selected.length > 0 ? selected : runtime.clipboard.state.paths;
  if (paths.length === 0) return;
  runtime.ui.actions.openTargetFolderDialog("copy", paths);
}

function openMoveTo(runtime: CommandRuntime) {
  const cur = runtime.activeSession?.() ?? runtime.session;
  const selected = selectedPaths(cur);
  const paths = selected.length > 0 ? selected : runtime.clipboard.state.paths;
  if (paths.length === 0) return;
  runtime.ui.actions.openTargetFolderDialog("move", paths);
}

function handleEscape(runtime: CommandRuntime) {
  if (runtime.ui.state.targetFolderDialog !== undefined) {
    runtime.ui.actions.closeTargetFolderDialog();
    return;
  }
  if (runtime.ui.state.viewerModal !== undefined) {
    runtime.ui.actions.closeViewer();
    return;
  }
  if (runtime.ui.state.inputDialog !== undefined) {
    runtime.ui.actions.closeInputDialog();
    return;
  }
  if (runtime.ui.state.mode === "command") {
    runtime.ui.actions.closeCommandLine();
    return;
  }
  if (runtime.ui.state.mode === "search") {
    closeSearch(runtime);
    return;
  }
  if (runtime.ui.state.properties !== undefined) {
    runtime.ui.actions.hideProperties();
    return;
  }
  if (runtime.ui.state.helpOpen) {
    runtime.ui.actions.toggleHelp();
    return;
  }
  const cur = runtime.activeSession?.() ?? runtime.session;
  if (cur.state.marked.length > 0) {
    cur.actions.clearMarked();
  }
}

function toggleMarked(runtime: CommandRuntime) {
  const path = runtime.currentEntryPath();
  if (path === undefined) return;
  const cur = runtime.activeSession?.() ?? runtime.session;
  cur.actions.toggleMarked(path);
  cur.actions.moveCursor(1);
}

function copySelection(runtime: CommandRuntime, mode: "copy" | "cut") {
  const cur = runtime.activeSession?.() ?? runtime.session;
  const paths = selectedPaths(cur);
  if (paths.length === 0) return;
  runtime.clipboard.actions.set(mode, paths);
  runtime.queue.actions.succeed(
    runtime.ui.translate(mode === "copy" ? "operation.copy.started" : "operation.cut.started", {
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

  const cur = runtime.activeSession?.() ?? runtime.session;
  const entry = visibleEntries(cur.state).find((item) => item.path === current);
  if (entry === undefined) return;
  runtime.ui.actions.showProperties(entry);
}

function toggleBookmarkCurrent(runtime: CommandRuntime) {
  const cur = runtime.activeSession?.() ?? runtime.session;
  const currentPath = runtime.currentEntryPath();
  const visible = visibleEntries(cur.state);
  const currentEntry = currentPath ? visible.find((e) => e.path === currentPath) : undefined;
  const targetPath = currentEntry?.isDirectory ? currentEntry.path : cur.state.cwd;

  const isPinned = runtime.ui.state.bookmarks.includes(targetPath);
  runtime.ui.actions.toggleBookmark(targetPath);
  if (isPinned) {
    runtime.queue.actions.succeed(runtime.ui.translate("bookmarks.unpinned"));
  } else {
    runtime.queue.actions.succeed(runtime.ui.translate("bookmarks.pinned"));
  }
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
  const cur = runtime.activeSession?.() ?? runtime.session;
  cur.actions.setQuery("");
  runtime.ui.actions.closeSearch();
  runtime.onExitSearch?.();
}

export function useCommandLayer(runtime: CommandRuntime) {
  const keymap = useKeymap();

  useBindings(() => ({
    priority: 0,
    commands: commandsFor(runtime),
    bindings: buildBindings(runtime.overrides),
  }));

  createEffect(() => {
    if (runtime.ui.state.quit) runtime.onQuit();
  });

  return keymap;
}
