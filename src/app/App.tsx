import { basename, dirname, join } from "node:path";

import { SyntaxStyle, TextAttributes } from "@opentui/core";
import { useRenderer, useTerminalDimensions } from "@opentui/solid";
import { createEffect, createMemo, Show } from "solid-js";

import { parseExCommand } from "../core/commands/exCommand";
import type { Entry } from "../core/entries/directory";
import { segmentsFor, shortPath } from "../core/entries/path";
import { extractArchive, isArchive } from "../core/operations/archive";
import {
  createDirectory,
  createEmptyFile,
  itemsFor,
  renameEntry,
  runOperation,
  TargetExists,
} from "../core/operations/operations";
import { openExternally } from "../core/operations/system";
import type { PreviewCache } from "../core/preview/cache";
import { glyph } from "../core/theme/icons";
import type { ClipboardStore, QueueStore } from "../state/operations";
import { selectedPaths } from "../state/operations";
import { createSessionStore, type SessionState, type SessionStore, visibleEntries } from "../state/session";
import type { UiStore } from "../state/ui";

import { CommandLine } from "./CommandLine";
import { ImageViewerDialog } from "./dialogs/ImageViewerDialog";
import { InputDialog } from "./dialogs/InputDialog";
import { PdfViewerDialog } from "./dialogs/PdfViewerDialog";
import { PropertiesDialog } from "./dialogs/PropertiesDialog";
import { TargetFolderDialog } from "./dialogs/TargetFolderDialog";
import { TextViewerDialog } from "./dialogs/TextViewerDialog";
import { FileGrid } from "./FileGrid";
import { FileList } from "./FileList";
import { HelpOverlay, helpEntries } from "./HelpOverlay";
import { PreviewPane } from "./PreviewPane";
import { Resizer } from "./Resizer";
import { SearchBar } from "./SearchBar";
import { type Place, Sidebar } from "./Sidebar";
import { StatusBar } from "./StatusBar";
import { TitleBar } from "./TitleBar";
import { ToastNotification } from "./ToastNotification";

export type AppProps = {
  keymapOverrides: Record<string, string[]>;
  previewCache: PreviewCache;
  clipboard: ClipboardStore;
  queue: QueueStore;
  session: SessionStore;
  secondarySession?: SessionStore;
  ui: UiStore;
  places: Place[];
  home: string;
  separator: string;
  freeSpace: number | undefined;
};

function fallbackSession(cwd: string): SessionState {
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

export function App(props: AppProps) {
  const renderer = useRenderer();
  const dimensions = useTerminalDimensions();
  const syntaxStyle = createMemo(() => SyntaxStyle.create(renderer.nativeScene.resourceContext));
  const palette = createMemo(() => props.ui.palette());

  const fallbackRight = createSessionStore(fallbackSession(props.session.state.cwd));
  const rightSession = () => props.secondarySession ?? fallbackRight;
  const activeSession = () =>
    props.ui.state.splitPane && props.ui.state.activePane === "right" ? rightSession() : props.session;
  const inactiveSession = () =>
    props.ui.state.splitPane && props.ui.state.activePane === "right" ? props.session : rightSession();

  createEffect(() => {
    if (props.ui.state.splitPane) {
      const r = rightSession();
      if (r.state.entries.length === 0 && !r.state.loading) {
        void r.actions.load(r.state.cwd || props.session.state.cwd);
      }
    }
  });

  const leftVisible = createMemo(() => visibleEntries(props.session.state));
  const rightVisible = createMemo(() => visibleEntries(rightSession().state));
  const activeVisible = createMemo(() =>
    props.ui.state.splitPane && props.ui.state.activePane === "right" ? rightVisible() : leftVisible(),
  );

  const segments = createMemo(() => segmentsFor(activeSession().state.cwd, props.home));
  const gridColumns = createMemo(() => {
    const sidebar = props.ui.state.sidebarVisible ? props.ui.state.sidebarWidth : 0;
    const preview = props.ui.state.previewVisible ? props.ui.state.previewWidth : 0;
    const usable = dimensions().width - sidebar - preview;
    return Math.max(1, Math.floor(usable / 18));
  });

  const currentEntry = createMemo(() => activeVisible()[activeSession().state.cursor]);
  const markedSize = createMemo(() => {
    const marked = activeSession().state.marked;
    if (marked.length === 0) return undefined;
    return activeVisible()
      .filter((entry) => marked.includes(entry.path))
      .reduce((total, entry) => total + (entry.size ?? 0), 0);
  });

  createEffect(() => {
    if (props.ui.state.quit) renderer.destroy();
  });

  const hints = createMemo(() => [
    { key: "j/k", label: props.ui.translate("navigation.back") },
    { key: "v", label: props.ui.translate("view.list") },
    { key: "F3", label: props.ui.translate("view.splitPane") },
    { key: "Tab", label: `${props.ui.translate("view.leftPane")}/${props.ui.translate("view.rightPane")}` },
    { key: ":", label: props.ui.translate("modes.command") },
    { key: "?", label: props.ui.translate("help.title") },
  ]);

  function handleSplitDrag(x: number) {
    const sidebarW = props.ui.state.sidebarVisible ? props.ui.state.sidebarWidth : 0;
    const previewW = props.ui.state.previewVisible ? props.ui.state.previewWidth : 0;
    const availableW = dimensions().width - sidebarW - previewW;
    if (availableW > 20) {
      const relX = x - sidebarW;
      const ratio = Math.max(0.2, Math.min(0.8, relX / availableW));
      props.ui.actions.setSplitRatio(ratio);
    }
  }

  async function handleInputConfirm(value: string) {
    const dialog = props.ui.state.inputDialog;
    if (dialog === undefined) return;
    props.ui.actions.closeInputDialog();

    try {
      if (dialog.kind === "mkdir") {
        await createDirectory(join(activeSession().state.cwd, value));
        props.queue.actions.succeed(props.ui.translate("operation.mkdir.done"));
      } else if (dialog.kind === "rename" && dialog.targetPath !== undefined) {
        const dest = join(dirname(dialog.targetPath), value);
        await renameEntry(dialog.targetPath, dest);
        props.queue.actions.succeed(props.ui.translate("operation.rename.done"));
      } else if (dialog.kind === "newFile") {
        await createEmptyFile(join(activeSession().state.cwd, value));
        props.queue.actions.succeed(props.ui.translate("operation.newFile.done"));
      }
      await activeSession().actions.load(activeSession().state.cwd);
    } catch {
      const failKey =
        dialog.kind === "mkdir"
          ? "operation.mkdir.failed"
          : dialog.kind === "rename"
            ? "operation.rename.failed"
            : "operation.newFile.failed";
      props.queue.actions.fail(props.ui.translate(failKey));
    }
  }

  async function handleTargetFolderConfirm(destPath: string) {
    const dialog = props.ui.state.targetFolderDialog;
    if (dialog === undefined) return;
    props.ui.actions.closeTargetFolderDialog();

    const items = itemsFor(dialog.sources, destPath);
    props.queue.actions.report({
      kind: dialog.mode,
      current: 0,
      total: items.length,
      path: destPath,
    });

    try {
      await runOperation(dialog.mode, items, {
        signal: new AbortController().signal,
        onProgress: (p) => props.queue.actions.report(p),
      }).promise;

      if (dialog.mode === "move") {
        props.clipboard.actions.clear();
      }
      props.queue.actions.succeed(props.ui.translate(`operation.${dialog.mode}.done`));
      await activeSession().actions.load(activeSession().state.cwd);
      if (props.ui.state.splitPane) {
        await inactiveSession().actions.load(inactiveSession().state.cwd);
      }
    } catch (err) {
      if (err instanceof TargetExists) {
        props.queue.actions.fail(props.ui.translate("operation.conflict.title"));
      } else {
        props.queue.actions.fail(props.ui.translate(`operation.${dialog.mode}.failed`));
      }
    }
  }

  async function handleOpen(entry: Entry, targetSession?: SessionStore) {
    const sess = targetSession ?? activeSession();
    if (entry.isDirectory) {
      await sess.actions.load(entry.path);
      return;
    }

    if (isArchive(entry.name)) {
      props.queue.actions.succeed(props.ui.translate("operation.extract.started", { name: entry.name }));
      const result = await extractArchive(entry.path);
      if (result.success) {
        props.queue.actions.succeed(props.ui.translate("operation.extract.done"));
      } else {
        props.queue.actions.fail(props.ui.translate("operation.extract.failed", { name: entry.name }));
      }
      await sess.actions.load(sess.state.cwd);
      return;
    }

    const preview = await props.previewCache.get(entry);
    if (preview.kind === "image") {
      props.ui.actions.openImageViewer(entry);
      return;
    }
    if (preview.kind === "text") {
      props.ui.actions.openTextViewer(entry, preview.content, preview.filetype);
      return;
    }
    if (preview.kind === "pdf") {
      props.ui.actions.openPdfViewer(entry, preview.pdfPages ?? 1);
      return;
    }
    openExternally(entry.path);
  }

  async function handleCommandLine(command: string) {
    props.ui.actions.closeCommandLine();
    const parsed = parseExCommand(command);

    switch (parsed.kind) {
      case "cd": {
        const target = parsed.args[0] ?? props.home;
        await activeSession().actions.load(target);
        break;
      }
      case "touch": {
        const name = parsed.args[0];
        if (name) {
          await createEmptyFile(join(activeSession().state.cwd, name));
          await activeSession().actions.load(activeSession().state.cwd);
        }
        break;
      }
      case "mkdir": {
        const name = parsed.args[0];
        if (name) {
          await createDirectory(join(activeSession().state.cwd, name));
          await activeSession().actions.load(activeSession().state.cwd);
        }
        break;
      }
      case "theme": {
        props.ui.actions.toggleTheme();
        break;
      }
      case "sort": {
        const field = parsed.args[0];
        if (field === "name" || field === "size" || field === "modified") {
          activeSession().actions.setSort(field);
        }
        break;
      }
      case "view": {
        activeSession().actions.toggleView();
        break;
      }
      case "extract": {
        const paths = selectedPaths(activeSession());
        const archives = paths.filter((path) => isArchive(path));
        if (archives.length === 0) {
          props.queue.actions.fail(props.ui.translate("operation.extract.failed", { name: "" }));
          break;
        }
        for (const archive of archives) {
          const name = basename(archive);
          props.queue.actions.succeed(props.ui.translate("operation.extract.started", { name }));
          const result = await extractArchive(archive);
          if (result.success) {
            props.queue.actions.succeed(props.ui.translate("operation.extract.done"));
          } else {
            props.queue.actions.fail(props.ui.translate("operation.extract.failed", { name }));
          }
        }
        await activeSession().actions.load(activeSession().state.cwd);
        break;
      }
      case "copy": {
        const selected = selectedPaths(activeSession());
        const paths = selected.length > 0 ? selected : props.clipboard.state.paths;
        if (paths.length > 0) {
          props.ui.actions.openTargetFolderDialog("copy", paths);
        }
        break;
      }
      case "move": {
        const selected = selectedPaths(activeSession());
        const paths = selected.length > 0 ? selected : props.clipboard.state.paths;
        if (paths.length > 0) {
          props.ui.actions.openTargetFolderDialog("move", paths);
        }
        break;
      }
      case "quit": {
        props.ui.actions.quit();
        break;
      }
      case "unknown": {
        if (parsed.name !== "") {
          props.queue.actions.fail(props.ui.translate("commandLine.unknownCommand", { name: parsed.name }));
        }
        break;
      }
    }
  }

  return (
    <box flexDirection="column" width="100%" height="100%">
      <TitleBar
        palette={palette()}
        segments={segments()}
        separator={props.separator}
        query={activeSession().state.query}
        hint={props.ui.translate("search.placeholder")}
        onNavigate={(path) => void activeSession().actions.load(path)}
      />

      <box flexDirection="row" flexGrow={1}>
        <Show when={props.ui.state.sidebarVisible}>
          <Sidebar
            palette={palette()}
            iconSet={props.ui.state.iconSet}
            t={props.ui.translate}
            places={props.places}
            bookmarks={props.ui.state.bookmarks}
            activePath={activeSession().state.cwd}
            width={props.ui.state.sidebarWidth}
            onNavigate={(path) => void activeSession().actions.load(path)}
            onToggleBookmark={(path) => props.ui.actions.toggleBookmark(path)}
          />
          <Resizer palette={palette()} onDrag={(x) => props.ui.actions.setSidebarWidth(x)} />
        </Show>

        <Show
          when={props.ui.state.splitPane}
          fallback={
            <Show
              when={props.session.state.view === "grid"}
              fallback={
                <FileList
                  palette={palette()}
                  entries={leftVisible()}
                  cursor={props.session.state.cursor}
                  marked={props.session.state.marked}
                  clipboard={props.clipboard.state}
                  iconSet={props.ui.state.iconSet}
                  locale={props.ui.state.locale}
                  t={props.ui.translate}
                  isActive={true}
                  onSelect={(index) => props.session.actions.cursorTo(index)}
                  onSelectRange={(from, to) => props.session.actions.selectRange(from, to)}
                  onToggleMark={(path) => props.session.actions.toggleMarked(path)}
                  onOpen={(entry) => void handleOpen(entry, props.session)}
                  onMoveCursor={(delta) => props.session.actions.moveCursor(delta)}
                />
              }
            >
              <FileGrid
                palette={palette()}
                entries={leftVisible()}
                cursor={props.session.state.cursor}
                marked={props.session.state.marked}
                clipboard={props.clipboard.state}
                iconSet={props.ui.state.iconSet}
                columns={gridColumns()}
                isActive={true}
                onSelect={(index) => props.session.actions.cursorTo(index)}
                onSelectRange={(from, to) => props.session.actions.selectRange(from, to)}
                onToggleMark={(path) => props.session.actions.toggleMarked(path)}
                onOpen={(entry) => void handleOpen(entry, props.session)}
              />
            </Show>
          }
        >
          {/* Dual Pane Mode: Left Pane */}
          <box
            flexDirection="column"
            width={`${Math.round((props.ui.state.splitRatio ?? 0.5) * 100)}%`}
            flexGrow={1}
            border
            borderColor={props.ui.state.activePane === "left" ? palette()["border.focus"] : palette()["border.default"]}
            onMouseDown={() => props.ui.actions.setActivePane("left")}
          >
            <box
              flexDirection="row"
              justifyContent="space-between"
              height={1}
              paddingLeft={1}
              paddingRight={1}
              backgroundColor={props.ui.state.activePane === "left" ? palette()["bg.muted"] : palette()["bg.inset"]}
              onMouseDown={() => props.ui.actions.setActivePane("left")}
            >
              <box flexDirection="row" gap={1}>
                <text fg={palette()["fg.directory"]}>{glyph("file.directory", props.ui.state.iconSet)}</text>
                <text
                  fg={props.ui.state.activePane === "left" ? palette()["fg.accent"] : palette()["fg.default"]}
                  attributes={props.ui.state.activePane === "left" ? TextAttributes.BOLD : TextAttributes.NONE}
                >
                  {shortPath(props.session.state.cwd, props.home)}
                </text>
              </box>
              <text fg={props.ui.state.activePane === "left" ? palette()["fg.accent"] : palette()["fg.muted"]}>
                {props.ui.state.activePane === "left"
                  ? `● ${props.ui.translate("view.activePane")}`
                  : props.ui.translate("view.leftPane")}
              </text>
            </box>

            <Show
              when={props.session.state.view === "grid"}
              fallback={
                <FileList
                  palette={palette()}
                  entries={leftVisible()}
                  cursor={props.session.state.cursor}
                  marked={props.session.state.marked}
                  clipboard={props.clipboard.state}
                  iconSet={props.ui.state.iconSet}
                  locale={props.ui.state.locale}
                  t={props.ui.translate}
                  isActive={props.ui.state.activePane === "left"}
                  onSelect={(index) => {
                    props.ui.actions.setActivePane("left");
                    props.session.actions.cursorTo(index);
                  }}
                  onSelectRange={(from, to) => {
                    props.ui.actions.setActivePane("left");
                    props.session.actions.selectRange(from, to);
                  }}
                  onToggleMark={(path) => {
                    props.ui.actions.setActivePane("left");
                    props.session.actions.toggleMarked(path);
                  }}
                  onOpen={(entry) => void handleOpen(entry, props.session)}
                  onMoveCursor={(delta) => {
                    props.ui.actions.setActivePane("left");
                    props.session.actions.moveCursor(delta);
                  }}
                />
              }
            >
              <FileGrid
                palette={palette()}
                entries={leftVisible()}
                cursor={props.session.state.cursor}
                marked={props.session.state.marked}
                clipboard={props.clipboard.state}
                iconSet={props.ui.state.iconSet}
                columns={Math.max(1, Math.floor(gridColumns() * (props.ui.state.splitRatio ?? 0.5)))}
                isActive={props.ui.state.activePane === "left"}
                onSelect={(index) => {
                  props.ui.actions.setActivePane("left");
                  props.session.actions.cursorTo(index);
                }}
                onSelectRange={(from, to) => {
                  props.ui.actions.setActivePane("left");
                  props.session.actions.selectRange(from, to);
                }}
                onToggleMark={(path) => {
                  props.ui.actions.setActivePane("left");
                  props.session.actions.toggleMarked(path);
                }}
                onOpen={(entry) => void handleOpen(entry, props.session)}
              />
            </Show>
          </box>

          {/* Resizer between panes */}
          <Resizer palette={palette()} onDrag={handleSplitDrag} />

          {/* Dual Pane Mode: Right Pane */}
          <box
            flexDirection="column"
            width={`${100 - Math.round((props.ui.state.splitRatio ?? 0.5) * 100)}%`}
            flexGrow={1}
            border
            borderColor={
              props.ui.state.activePane === "right" ? palette()["border.focus"] : palette()["border.default"]
            }
            onMouseDown={() => props.ui.actions.setActivePane("right")}
          >
            <box
              flexDirection="row"
              justifyContent="space-between"
              height={1}
              paddingLeft={1}
              paddingRight={1}
              backgroundColor={props.ui.state.activePane === "right" ? palette()["bg.muted"] : palette()["bg.inset"]}
              onMouseDown={() => props.ui.actions.setActivePane("right")}
            >
              <box flexDirection="row" gap={1}>
                <text fg={palette()["fg.directory"]}>{glyph("file.directory", props.ui.state.iconSet)}</text>
                <text
                  fg={props.ui.state.activePane === "right" ? palette()["fg.accent"] : palette()["fg.default"]}
                  attributes={props.ui.state.activePane === "right" ? TextAttributes.BOLD : TextAttributes.NONE}
                >
                  {shortPath(rightSession().state.cwd, props.home)}
                </text>
              </box>
              <text fg={props.ui.state.activePane === "right" ? palette()["fg.accent"] : palette()["fg.muted"]}>
                {props.ui.state.activePane === "right"
                  ? `● ${props.ui.translate("view.activePane")}`
                  : props.ui.translate("view.rightPane")}
              </text>
            </box>

            <Show
              when={rightSession().state.view === "grid"}
              fallback={
                <FileList
                  palette={palette()}
                  entries={rightVisible()}
                  cursor={rightSession().state.cursor}
                  marked={rightSession().state.marked}
                  clipboard={props.clipboard.state}
                  iconSet={props.ui.state.iconSet}
                  locale={props.ui.state.locale}
                  t={props.ui.translate}
                  isActive={props.ui.state.activePane === "right"}
                  onSelect={(index) => {
                    props.ui.actions.setActivePane("right");
                    rightSession().actions.cursorTo(index);
                  }}
                  onSelectRange={(from, to) => {
                    props.ui.actions.setActivePane("right");
                    rightSession().actions.selectRange(from, to);
                  }}
                  onToggleMark={(path) => {
                    props.ui.actions.setActivePane("right");
                    rightSession().actions.toggleMarked(path);
                  }}
                  onOpen={(entry) => void handleOpen(entry, rightSession())}
                  onMoveCursor={(delta) => {
                    props.ui.actions.setActivePane("right");
                    rightSession().actions.moveCursor(delta);
                  }}
                />
              }
            >
              <FileGrid
                palette={palette()}
                entries={rightVisible()}
                cursor={rightSession().state.cursor}
                marked={rightSession().state.marked}
                clipboard={props.clipboard.state}
                iconSet={props.ui.state.iconSet}
                columns={Math.max(1, Math.floor(gridColumns() * (1 - (props.ui.state.splitRatio ?? 0.5))))}
                isActive={props.ui.state.activePane === "right"}
                onSelect={(index) => {
                  props.ui.actions.setActivePane("right");
                  rightSession().actions.cursorTo(index);
                }}
                onSelectRange={(from, to) => {
                  props.ui.actions.setActivePane("right");
                  rightSession().actions.selectRange(from, to);
                }}
                onToggleMark={(path) => {
                  props.ui.actions.setActivePane("right");
                  rightSession().actions.toggleMarked(path);
                }}
                onOpen={(entry) => void handleOpen(entry, rightSession())}
              />
            </Show>
          </box>
        </Show>

        <Show when={props.ui.state.previewVisible}>
          <Resizer palette={palette()} onDrag={(x) => props.ui.actions.setPreviewWidth(dimensions().width - x)} />
          <PreviewPane
            palette={palette()}
            entry={currentEntry()}
            cache={props.previewCache}
            syntaxStyle={syntaxStyle()}
            t={props.ui.translate}
            locale={props.ui.state.locale}
            width={props.ui.state.previewWidth}
          />
        </Show>
      </box>

      <Show when={props.ui.state.mode === "search"}>
        <SearchBar
          palette={palette()}
          label={props.ui.translate("modes.search")}
          placeholder={props.ui.translate("search.placeholder")}
          onQuery={(q: string) => activeSession().actions.setQuery(q)}
          onSubmit={() => props.ui.actions.closeSearch()}
        />
      </Show>

      <Show when={props.ui.state.mode === "command"}>
        <CommandLine
          palette={palette()}
          prompt=":"
          placeholder={props.ui.translate("commandLine.placeholder")}
          onExecute={(command: string) => void handleCommandLine(command)}
          onCancel={() => props.ui.actions.closeCommandLine()}
        />
      </Show>

      <HelpOverlay
        palette={palette()}
        open={props.ui.state.helpOpen}
        t={props.ui.translate}
        entries={helpEntries(props.keymapOverrides)}
      />

      <Show when={props.ui.state.inputDialog !== undefined}>
        {(() => {
          const dialog = props.ui.state.inputDialog;
          return dialog !== undefined ? (
            <InputDialog
              palette={palette()}
              kind={dialog.kind}
              initialValue={dialog.initialValue}
              t={props.ui.translate}
              onConfirm={(val) => void handleInputConfirm(val)}
              onCancel={() => props.ui.actions.closeInputDialog()}
            />
          ) : null;
        })()}
      </Show>

      <Show when={props.ui.state.properties !== undefined}>
        {(() => {
          const properties = props.ui.state.properties;
          return properties !== undefined ? (
            <PropertiesDialog
              palette={palette()}
              entry={properties}
              locale={props.ui.state.locale}
              t={props.ui.translate}
              onClose={() => props.ui.actions.hideProperties()}
            />
          ) : null;
        })()}
      </Show>

      <Show when={props.ui.state.viewerModal !== undefined}>
        {(() => {
          const modal = props.ui.state.viewerModal;
          if (modal?.kind === "image") {
            return (
              <ImageViewerDialog
                palette={palette()}
                entry={modal.entry}
                t={props.ui.translate}
                onClose={() => props.ui.actions.closeViewer()}
              />
            );
          }
          if (modal?.kind === "text") {
            return (
              <TextViewerDialog
                palette={palette()}
                entry={modal.entry}
                content={modal.content}
                filetype={modal.filetype}
                syntaxStyle={syntaxStyle()}
                t={props.ui.translate}
                onClose={() => props.ui.actions.closeViewer()}
              />
            );
          }
          if (modal?.kind === "pdf") {
            return (
              <PdfViewerDialog
                palette={palette()}
                iconSet={props.ui.state.iconSet}
                entry={modal.entry}
                totalPages={modal.totalPages}
                initialPage={modal.initialPage}
                t={props.ui.translate}
                onClose={() => props.ui.actions.closeViewer()}
              />
            );
          }
          return null;
        })()}
      </Show>

      <Show when={props.ui.state.targetFolderDialog !== undefined}>
        {(() => {
          const dialog = props.ui.state.targetFolderDialog;
          return dialog !== undefined ? (
            <TargetFolderDialog
              palette={palette()}
              iconSet={props.ui.state.iconSet}
              mode={dialog.mode}
              sources={dialog.sources}
              initialDirectory={props.ui.state.splitPane ? inactiveSession().state.cwd : activeSession().state.cwd}
              places={props.places}
              t={props.ui.translate}
              onConfirm={(dest) => void handleTargetFolderConfirm(dest)}
              onCancel={() => props.ui.actions.closeTargetFolderDialog()}
            />
          ) : null;
        })()}
      </Show>

      <ToastNotification
        palette={palette()}
        iconSet={props.ui.state.iconSet}
        queue={props.queue.state}
        t={props.ui.translate}
      />

      <StatusBar
        palette={palette()}
        total={activeSession().state.entries.length}
        visible={activeVisible().length}
        marked={activeSession().state.marked.length}
        selectedSize={markedSize()}
        freeSpace={props.freeSpace}
        loading={activeSession().state.loading}
        message={activeSession().state.error ?? props.queue.state.error ?? props.queue.state.message}
        t={props.ui.translate}
        hints={hints()}
      />
    </box>
  );
}
