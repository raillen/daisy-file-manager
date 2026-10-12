export type EntryKind =
  | "directory"
  | "symlink"
  | "executable"
  | "archive"
  | "audio"
  | "video"
  | "image"
  | "code"
  | "json"
  | "markdown"
  | "pdf"
  | "spreadsheet"
  | "text"
  | "package"
  | "config"
  | "database"
  | "generic";

const extensionKinds: Record<string, EntryKind> = {
  ts: "code",
  tsx: "code",
  js: "code",
  jsx: "code",
  mjs: "code",
  cjs: "code",
  rs: "code",
  py: "code",
  go: "code",
  java: "code",
  c: "code",
  h: "code",
  cpp: "code",
  sh: "code",
  bash: "code",
  zsh: "code",
  lua: "code",
  zig: "code",
  json: "json",
  jsonc: "json",
  yml: "config",
  yaml: "config",
  toml: "config",
  ini: "config",
  env: "config",
  conf: "config",
  md: "markdown",
  mdx: "markdown",
  txt: "text",
  log: "text",
  png: "image",
  jpg: "image",
  jpeg: "image",
  gif: "image",
  webp: "image",
  bmp: "image",
  svg: "image",
  ico: "image",
  mp4: "video",
  mkv: "video",
  webm: "video",
  mov: "video",
  mp3: "audio",
  wav: "audio",
  flac: "audio",
  ogg: "audio",
  zip: "archive",
  tar: "archive",
  gz: "archive",
  bz2: "archive",
  xz: "archive",
  zst: "archive",
  rar: "archive",
  "7z": "archive",
  pdf: "pdf",
  csv: "spreadsheet",
  xls: "spreadsheet",
  xlsx: "spreadsheet",
  ods: "spreadsheet",
  db: "database",
  sqlite: "database",
  sqlite3: "database",
};

const stemKinds: Record<string, EntryKind> = {
  "package.json": "package",
  "bun.lock": "package",
  "package-lock.json": "package",
  pnpm: "package",
  yarn: "package",
  dockerfile: "config",
  makefile: "config",
  ".gitignore": "config",
  ".env": "config",
};

export function kindFromName(name: string): EntryKind {
  const lower = name.toLowerCase();
  const stemKind = stemKinds[lower];
  if (stemKind !== undefined) return stemKind;

  const dot = lower.lastIndexOf(".");
  if (dot <= 0) return "generic";
  const extension = lower.slice(dot + 1);
  return extensionKinds[extension] ?? "generic";
}
