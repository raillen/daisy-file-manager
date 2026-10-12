import { readdir, readFile, stat } from "node:fs/promises";

import type { Entry } from "../entries/directory";
import { type EntryKind, kindFromName } from "../entries/kind";
import { getPdfInfo, renderPdfPage } from "../pdf/pdf";

export type PreviewSource = {
  kind: "image" | "text" | "directory" | "metadata" | "pdf";
  path: string;
  content: string;
  filetype: string;
  childCount: number;
  folderCount: number;
  pdfPages?: number;
  coverImage?: string;
};

export type PreviewLimits = {
  maxTextBytes: number;
};

const imageExtensions = new Set(["png", "jpg", "jpeg", "gif", "webp", "bmp"]);
const codeExtensions = new Set([
  "ts",
  "tsx",
  "js",
  "jsx",
  "mjs",
  "cjs",
  "rs",
  "py",
  "go",
  "java",
  "c",
  "h",
  "cpp",
  "sh",
  "bash",
  "zsh",
  "lua",
  "zig",
  "json",
  "jsonc",
  "yml",
  "yaml",
  "toml",
  "ini",
  "conf",
  "md",
  "mdx",
  "txt",
  "log",
  "html",
  "css",
  "scss",
  "sql",
  "vue",
  "svelte",
]);

function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(dot + 1).toLocaleLowerCase("en-US") : "";
}

function filetypeFor(name: string): string {
  const extension = extensionOf(name);
  return extension === "" ? "text" : extension;
}

async function previewDirectory(entry: Entry): Promise<PreviewSource> {
  const childCount = (await readdir(entry.path)).length;
  let folderCount = 0;
  for (const name of await readdir(entry.path)) {
    try {
      const info = await stat(`${entry.path}/${name}`);
      if (info.isDirectory()) folderCount += 1;
    } catch {
      // Item inacessível não invalida a contagem.
    }
  }

  return {
    kind: "directory",
    path: entry.path,
    content: "",
    filetype: "directory",
    childCount,
    folderCount,
  };
}

async function previewText(entry: Entry, limits: PreviewLimits): Promise<PreviewSource | undefined> {
  const info = await stat(entry.path);
  if (info.size > limits.maxTextBytes) return undefined;

  const buffer = await readFile(entry.path);
  const head = buffer.subarray(0, 4096);
  if (head.includes(0)) return undefined;

  return {
    kind: "text",
    path: entry.path,
    content: buffer.toString("utf8"),
    filetype: filetypeFor(entry.name),
    childCount: 0,
    folderCount: 0,
  };
}

export async function previewFor(entry: Entry, limits: PreviewLimits): Promise<PreviewSource> {
  if (entry.isDirectory) return previewDirectory(entry);

  const extension = extensionOf(entry.name);
  if (imageExtensions.has(extension)) {
    return { kind: "image", path: entry.path, content: "", filetype: extension, childCount: 0, folderCount: 0 };
  }

  if (extension === "pdf") {
    const info = await getPdfInfo(entry.path);
    const coverImage = await renderPdfPage(entry.path, 1, 100);
    return {
      kind: "pdf",
      path: entry.path,
      content: "",
      filetype: "pdf",
      childCount: 0,
      folderCount: 0,
      pdfPages: info.pages,
      coverImage,
    };
  }

  const kind: EntryKind = kindFromName(entry.name);
  const isTextual =
    codeExtensions.has(extension) ||
    kind === "text" ||
    kind === "code" ||
    kind === "json" ||
    kind === "config" ||
    kind === "markdown";
  if (isTextual) {
    const text = await previewText(entry, limits);
    if (text !== undefined) return text;
  }

  return {
    kind: "metadata",
    path: entry.path,
    content: "",
    filetype: extension === "" ? "binary" : extension,
    childCount: 0,
    folderCount: 0,
  };
}
