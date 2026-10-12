import { basename, dirname, join } from "node:path";

import { SyntaxStyle } from "@opentui/core";
import { useRenderer, useTerminalDimensions } from "@opentui/solid";
import { createEffect, createMemo, Show } from "solid-js";

import { parseExCommand } from "../core/commands/exCommand";
import type { Entry } from "../core/entries/directory";
import { segmentsFor } from "../core/entries/path";
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
import type { ClipboardStore, QueueStore } from "../state/operations";
import { selectedPaths, trashSelection } from "../state/operations";
import type { SessionStore } from "../state/session";
import { visibleEntries } from "../state/session";
import type { UiStore } from "../state/ui";

import { CommandLine } from "./CommandLine";
import { ImageViewerDialog } from "./dialogs/ImageViewerDialog";
import { InputDialog } from "./dialogs/InputDialog";
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
  ui: UiStore;
  places: Place[];
  home: string;
  separator: string;
  freeSpace: number | undefined;
};

export function App(props: AppProps) {
  const renderer = useRenderer();
  const dimensions = useTerminalDimensions();
  const syntaxStyle = createMemo(() => SyntaxStyle.create(renderer.nativeScene.resourceContext));
  const palette = createMemo(() => props.ui.palette());
  const visible = createMemo(() => visibleEntries(props.session.state));
  const segments = createMemo(() => segmentsFor(props.session.state.cwd, props.home));
  const gridColumns = createMemo(() => {
    const sidebar = props.ui.state.sidebarVisible ? props.ui.state.sidebarWidth : 0;
    const preview = props.ui.state.previewVisible ? props.ui.state.previewWidth : 0;
    const usable = dimensions().width - sidebar - preview;
    return Math.max(1, Math.floor(usable / 18));
  });
  const currentEntry = createMemo(() => visible()[props.session.state.cursor]);
  const markedSize = createMemo(() => {
    const marked = props.session.state.marked;
    if (marked.length === 0) return undefined;
    return visible()
      .filter((entry) => marked.includes(entry.path))
      .reduce((total, entry) => total + (entry.size ?? 0), 0);
  });

  createEffect(() => {
    if (props.ui.state.quit) renderer.destroy();
  });

  const hints = createMemo(() => [
    { key: "j/k", label: props.ui.translate("navigation.back") },
    { key: "v", label: props.ui.translate("view.list") },
    { key: ":", label: props.ui.translate("modes.command") },
    { key: "?", label: props.ui.translate("help.title") },
  ]);

  async function handleInputConfirm(value: string) {
    const dialog = props.ui.state.inputDialog;
    if (dialog === undefined) return;
    props.ui.actions.closeInputDialog();

    try {
      if (dialog.kind === "mkdir") {
        await createDirectory(join(props.session.state.cwd, value));
        props.queue.actions.succeed(props.ui.translate("operation.mkdir.done"));
      } else if (dialog.kind === "rename" && dialog.targetPath !== undefined) {
        const dest = join(dirname(dialog.targetPath), value);
        await renameEntry(dialog.targetPath, dest);
        props.queue.actions.succeed(props.ui.translate("operation.rename.done"));
      } else if (dialog.kind === "newFile") {
        await createEmptyFile(join(props.session.state.cwd, value));
        props.queue.actions.succeed(props.ui.translate("operation.newFile.done"));
      }
      await props.session.actions.load(props.session.state.cwd);
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
      props.session.actions.clearMarked();
      props.queue.actions.succeed(props.ui.translate(`operation.${dialog.mode}.done`));
      await props.session.actions.load(props.session.state.cwd);
    } catch (err) {
      if (err instanceof TargetExists) {
        props.queue.actions.fail(
          props.ui.translate("dialog.confirm.overwrite.message", {
            name: err.target.split("/").pop() ?? err.target,
            directory: destPath,
          }),
        );
      } else {
        props.queue.actions.fail(err instanceof Error ? err.message : String(err));
      }
      await props.session.actions.load(props.session.state.cwd);
    }
  }

  async function handleOpen(entry: Entry) {
    if (entry.isDirectory) {
      await props.session.actions.enter();
      return;
    }
    if (isArchive(entry.name)) {
      const name = basename(entry.path);
      props.queue.actions.succeed(props.ui.translate("operation.extract.started", { name }));
      const result = await extractArchive(entry.path);
      if (result.success) {
        props.queue.actions.succeed(props.ui.translate("operation.extract.done"));
      } else {
        props.queue.actions.fail(props.ui.translate("operation.extract.failed", { name }));
      }
      await props.session.actions.load(props.session.state.cwd);
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
    openExternally(entry.path);
  }

  async function handleExCommand(input: string) {
    props.ui.actions.closeCommandLine();
    const parsed = parseExCommand(input);

    switch (parsed.kind) {
      case "cd": {
        const dest = parsed.args[0] ?? props.home;
        await props.session.actions.load(dest);
        break;
      }
      case "mkdir": {
        const name = parsed.args[0];
        if (name !== undefined) {
          try {
            await createDirectory(join(props.session.state.cwd, name));
            props.queue.actions.succeed(props.ui.translate("operation.mkdir.done"));
            await props.session.actions.load(props.session.state.cwd);
          } catch {
            props.queue.actions.fail(props.ui.translate("operation.mkdir.failed"));
          }
        }
        break;
      }
      case "touch": {
        const name = parsed.args[0];
        if (name !== undefined) {
          try {
            await createEmptyFile(join(props.session.state.cwd, name));
            props.queue.actions.succeed(props.ui.translate("operation.newFile.done"));
            await props.session.actions.load(props.session.state.cwd);
          } catch {
            props.queue.actions.fail(props.ui.translate("operation.newFile.failed"));
          }
        }
        break;
      }
      case "trash": {
        const paths = selectedPaths(props.session);
        await trashSelection(
          {
            session: props.session,
            clipboard: props.clipboard,
            queue: props.queue,
            translate: props.ui.translate,
            reload: () => props.session.actions.load(props.session.state.cwd),
          },
          paths,
        );
        break;
      }
      case "theme": {
        props.ui.actions.toggleTheme();
        break;
      }
      case "help": {
        props.ui.actions.toggleHelp();
        break;
      }
      case "sort": {
        const field = parsed.args[0];
        if (field === "name" || field === "size" || field === "modified") {
          props.session.actions.setSort(field);
        }
        break;
      }
      case "view": {
        props.session.actions.toggleView();
        break;
      }
      case "extract": {
        const paths = selectedPaths(props.session);
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
        await props.session.actions.load(props.session.state.cwd);
        break;
      }
      case "copy": {
        const selected = selectedPaths(props.session);
        const paths = selected.length > 0 ? selected : props.clipboard.state.paths;
        if (paths.length > 0) {
          props.ui.actions.openTargetFolderDialog("copy", paths);
        }
        break;
      }
      case "move": {
        const selected = selectedPaths(props.session);
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
        query={props.session.state.query}
        hint={props.ui.translate("search.placeholder")}
        onNavigate={(path) => void props.session.actions.load(path)}
      />

      <box flexDirection="row" flexGrow={1}>
        <Show when={props.ui.state.sidebarVisible}>
          <Sidebar
            palette={palette()}
            iconSet={props.ui.state.iconSet}
            t={props.ui.translate}
            places={props.places}
            activePath={props.session.state.cwd}
            width={props.ui.state.sidebarWidth}
            onNavigate={(path) => void props.session.actions.load(path)}
          />
          <Resizer palette={palette()} onDrag={(x) => props.ui.actions.setSidebarWidth(x)} />
        </Show>

        <Show
          when={props.session.state.view === "grid"}
          fallback={
            <FileList
              palette={palette()}
              entries={visible()}
              cursor={props.session.state.cursor}
              marked={props.session.state.marked}
              clipboard={props.clipboard.state}
              iconSet={props.ui.state.iconSet}
              locale={props.ui.state.locale}
              t={props.ui.translate}
              onSelect={(index) => props.session.actions.cursorTo(index)}
              onSelectRange={(from, to) => props.session.actions.selectRange(from, to)}
              onToggleMark={(path) => props.session.actions.toggleMarked(path)}
              onOpen={(entry) => void handleOpen(entry)}
              onMoveCursor={(delta) => props.session.actions.moveCursor(delta)}
            />
          }
        >
          <FileGrid
            palette={palette()}
            entries={visible()}
            cursor={props.session.state.cursor}
            marked={props.session.state.marked}
            clipboard={props.clipboard.state}
            iconSet={props.ui.state.iconSet}
            columns={gridColumns()}
            onSelect={(index) => props.session.actions.cursorTo(index)}
            onSelectRange={(from, to) => props.session.actions.selectRange(from, to)}
            onToggleMark={(path) => props.session.actions.toggleMarked(path)}
            onOpen={(entry) => void handleOpen(entry)}
          />
        </Show>

        <Show when={props.ui.state.splitPane}>
          <box width={1} backgroundColor={palette()["bg.default"]}>
            <text fg={palette()["fg.muted"]}>{"│"}</text>
          </box>
          <FileList
            palette={palette()}
            entries={visible()}
            cursor={props.session.state.cursor}
            marked={props.session.state.marked}
            clipboard={props.clipboard.state}
            iconSet={props.ui.state.iconSet}
            locale={props.ui.state.locale}
            t={props.ui.translate}
            onSelect={(index) => props.session.actions.cursorTo(index)}
            onSelectRange={(from, to) => props.session.actions.selectRange(from, to)}
            onToggleMark={(path) => props.session.actions.toggleMarked(path)}
            onOpen={(entry) => void handleOpen(entry)}
            onMoveCursor={(delta) => props.session.actions.moveCursor(delta)}
          />
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
          onQuery={(value) => props.session.actions.setQuery(value)}
          onSubmit={() => props.ui.actions.closeSearch()}
        />
      </Show>

      <Show when={props.ui.state.mode === "command"}>
        <CommandLine
          palette={palette()}
          prompt={props.ui.translate("commandLine.prompt")}
          placeholder={props.ui.translate("commandLine.hint")}
          onExecute={(cmd) => void handleExCommand(cmd)}
          onCancel={() => props.ui.actions.closeCommandLine()}
        />
      </Show>

      <HelpOverlay
        open={props.ui.state.helpOpen}
        palette={palette()}
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
              initialDirectory={props.session.state.cwd}
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
        total={props.session.state.entries.length}
        visible={visible().length}
        marked={props.session.state.marked.length}
        selectedSize={markedSize()}
        freeSpace={props.freeSpace}
        loading={props.session.state.loading}
        message={props.session.state.error ?? props.queue.state.error ?? props.queue.state.message}
        t={props.ui.translate}
        hints={hints()}
      />
    </box>
  );
}
