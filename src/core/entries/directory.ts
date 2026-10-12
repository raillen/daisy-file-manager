import type { Dirent } from "node:fs";
import { lstat, readdir, stat } from "node:fs/promises";
import { basename, join, resolve } from "node:path";

import { type EntryKind, kindFromName } from "./kind";

export type Entry = {
  name: string;
  path: string;
  kind: EntryKind;
  isDirectory: boolean;
  isSymlink: boolean;
  size: number | undefined;
  modifiedMs: number | undefined;
  permissions: string;
};

function permissionsText(mode: number): string {
  const bits = [
    [0o400, "r"],
    [0o200, "w"],
    [0o100, "x"],
    [0o040, "r"],
    [0o020, "w"],
    [0o010, "x"],
    [0o004, "r"],
    [0o002, "w"],
    [0o001, "x"],
  ] as const;

  let text = mode & 0o040000 ? "d" : "-";
  for (const [bit, letter] of bits) {
    text += (mode & bit) !== 0 ? letter : "-";
  }
  return text;
}

function entryKind(dirent: Dirent, name: string): EntryKind {
  if (dirent.isDirectory()) return "directory";
  if (dirent.isSymbolicLink()) return "symlink";
  return kindFromName(name);
}

async function enrich(dirent: Dirent, parent: string): Promise<Entry> {
  const path = join(parent, dirent.name);
  const kind = entryKind(dirent, dirent.name);

  let size: number | undefined;
  let modifiedMs: number | undefined;
  let permissions = "---------";
  let isDirectory = dirent.isDirectory();
  const isSymlink = dirent.isSymbolicLink();

  try {
    if (isSymlink) {
      const stats = await stat(path);
      isDirectory = stats.isDirectory();
    }
    const stats = await lstat(path);
    size = stats.size;
    modifiedMs = stats.mtimeMs;
    permissions = permissionsText(stats.mode);
  } catch {
    // Item inacessível ou removido no meio da leitura: devolve o que já sabemos.
  }

  return {
    name: dirent.name,
    path,
    kind,
    isDirectory,
    isSymlink,
    size,
    modifiedMs,
    permissions,
  };
}

export async function readDirectory(path: string): Promise<Entry[]> {
  const target = resolve(path);
  const dirents = await readdir(target, { withFileTypes: true });
  const entries = await Promise.all(dirents.map((dirent) => enrich(dirent, target)));
  return entries;
}

export function isHidden(name: string): boolean {
  return name.startsWith(".");
}

export function displayName(path: string): string {
  return basename(path) === "" ? path : basename(path);
}
