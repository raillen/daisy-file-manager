import { createStore, produce } from "solid-js/store";
import {
  itemsFor,
  type OperationKind,
  type OperationProgress,
  runOperation,
  TargetExists,
} from "../core/operations/operations";
import { moveToTrash } from "../core/operations/system";
import { type SessionStore, visibleEntries } from "./session";

export type ClipboardMode = "copy" | "cut";

export type ClipboardState = {
  mode: ClipboardMode;
  paths: string[];
};

export type ClipboardStore = {
  state: ClipboardState;
  actions: {
    set: (mode: ClipboardMode, paths: string[]) => void;
    clear: () => void;
  };
};

export type QueueState = {
  running: boolean;
  progress: OperationProgress | undefined;
  message: string | undefined;
  error: string | undefined;
};

export type QueueStore = {
  state: QueueState;
  actions: {
    report: (progress: OperationProgress) => void;
    succeed: (message: string) => void;
    fail: (error: string) => void;
    reset: () => void;
  };
};

export function createClipboardStore(): ClipboardStore {
  const [state, setState] = createStore<ClipboardState>({ mode: "copy", paths: [] });

  return {
    state,
    actions: {
      set(mode, paths) {
        setState(
          produce((draft) => {
            draft.mode = mode;
            draft.paths = paths;
          }),
        );
      },
      clear() {
        setState(
          produce((draft) => {
            draft.paths = [];
          }),
        );
      },
    },
  };
}

export function createQueueStore(): QueueStore {
  const [state, setState] = createStore<QueueState>({
    running: false,
    progress: undefined,
    message: undefined,
    error: undefined,
  });

  return {
    state,
    actions: {
      report(progress) {
        setState(
          produce((draft) => {
            draft.running = true;
            draft.progress = progress;
          }),
        );
      },
      succeed(message) {
        setState(
          produce((draft) => {
            draft.running = false;
            draft.progress = undefined;
            draft.message = message;
          }),
        );
      },
      fail(error) {
        setState(
          produce((draft) => {
            draft.running = false;
            draft.progress = undefined;
            draft.error = error;
          }),
        );
      },
      reset() {
        setState(
          produce((draft) => {
            draft.running = false;
            draft.progress = undefined;
            draft.message = undefined;
            draft.error = undefined;
          }),
        );
      },
    },
  };
}

export function selectedPaths(session: SessionStore): string[] {
  const marked = session.state.marked;
  if (marked.length > 0) return [...marked];

  const current = visibleEntries(session.state)[session.state.cursor];
  return current === undefined ? [] : [current.path];
}

export type TransferDeps = {
  session: SessionStore;
  clipboard: ClipboardStore;
  queue: QueueStore;
  translate: (key: string, params?: Record<string, string | number>) => string;
  reload: () => Promise<void>;
};

export function pasteInto(deps: TransferDeps, destination: string): Promise<void> {
  const sources = deps.clipboard.state.paths;
  if (sources.length === 0) return Promise.resolve();

  const kind: OperationKind = deps.clipboard.state.mode === "cut" ? "move" : "copy";
  const items = itemsFor(sources, destination);

  deps.queue.actions.report({ kind, current: 0, total: items.length, path: destination });

  return runOperation(kind, items, {
    signal: new AbortController().signal,
    onProgress: (progress) => deps.queue.actions.report(progress),
  })
    .promise.then(async () => {
      if (kind === "move") deps.clipboard.actions.clear();
      deps.session.actions.clearMarked();
      deps.queue.actions.succeed(deps.translate(`operation.${kind}.done`));
      await deps.reload();
    })
    .catch(async (error: unknown) => {
      if (error instanceof TargetExists) {
        deps.queue.actions.fail(
          deps.translate("dialog.confirm.overwrite.message", {
            name: error.target.split("/").pop() ?? error.target,
            directory: destination,
          }),
        );
        return;
      }
      deps.queue.actions.fail(error instanceof Error ? error.message : String(error));
      await deps.reload();
    });
}

export async function trashSelection(deps: TransferDeps, paths: string[]): Promise<void> {
  if (paths.length === 0) return;

  deps.queue.actions.report({ kind: "trash", current: 0, total: paths.length, path: paths[0] ?? "" });

  const result = await moveToTrash(paths);
  if (result.ok) {
    deps.queue.actions.succeed(deps.translate("operation.delete.done"));
    await deps.reload();
    return;
  }

  deps.queue.actions.fail(deps.translate("operation.delete.failed", { name: paths[0] ?? "" }));
}
