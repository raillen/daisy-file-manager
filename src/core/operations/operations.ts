import { access, cp, mkdir, rename, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";

export type OperationKind = "copy" | "move" | "trash";

export type OperationItem = {
  source: string;
  target: string;
};

export type OperationProgress = {
  kind: OperationKind;
  current: number;
  total: number;
  path: string;
};

export type OperationHandle = {
  promise: Promise<void>;
  cancel: () => void;
};

export class OperationCancelled extends Error {
  constructor() {
    super("operacao cancelada");
    this.name = "OperationCancelled";
  }
}

export class TargetExists extends Error {
  readonly target: string;

  constructor(target: string) {
    super(`destino ja existe: ${target}`);
    this.name = "TargetExists";
    this.target = target;
  }
}

export type RunOptions = {
  signal: AbortSignal;
  onProgress: (progress: OperationProgress) => void;
  overwrite?: boolean;
};

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function assertTargetAvailable(target: string, overwrite: boolean) {
  if (overwrite) return;
  if (await exists(target)) throw new TargetExists(target);
}

async function transfer(kind: OperationKind, items: OperationItem[], options: RunOptions): Promise<void> {
  let current = 0;

  for (const item of items) {
    if (options.signal.aborted) throw new OperationCancelled();

    current += 1;
    options.onProgress({ kind, current, total: items.length, path: item.source });
    await mkdir(dirname(item.target), { recursive: true });

    if (kind === "copy") {
      await assertTargetAvailable(item.target, options.overwrite ?? false);
      await cp(item.source, item.target, { recursive: true, force: true });
      continue;
    }

    await assertTargetAvailable(item.target, options.overwrite ?? false);
    await rename(item.source, item.target);
  }
}

export function runOperation(kind: OperationKind, items: OperationItem[], options: RunOptions): OperationHandle {
  const controller = new AbortController();

  return {
    promise: transfer(kind, items, {
      ...options,
      signal: AbortSignal.any([options.signal, controller.signal]),
    }),
    cancel: () => controller.abort(),
  };
}

export async function createDirectory(path: string): Promise<void> {
  await mkdir(resolve(path));
}

export async function renameEntry(source: string, target: string, overwrite = false): Promise<void> {
  await assertTargetAvailable(target, overwrite);
  await rename(source, target);
}

export async function createEmptyFile(path: string): Promise<void> {
  await writeFile(path, "", { flag: "wx" });
}

export function targetFor(source: string, destinationDirectory: string): string {
  return join(destinationDirectory, basename(source));
}

export function itemsFor(sources: string[], destinationDirectory: string): OperationItem[] {
  return sources.map((source) => ({ source, target: targetFor(source, destinationDirectory) }));
}
