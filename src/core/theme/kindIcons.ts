import type { EntryKind } from "../entries/kind";

import type { IconName } from "./icons";

const kindIcons: Record<EntryKind, IconName> = {
  directory: "file.directory",
  symlink: "file.symlink",
  executable: "file.executable",
  archive: "file.archive",
  audio: "file.audio",
  video: "file.video",
  image: "file.image",
  code: "file.code",
  json: "file.code",
  markdown: "file.text",
  pdf: "file.pdf",
  spreadsheet: "file.spreadsheet",
  text: "file.text",
  package: "file.package",
  config: "file.config",
  database: "file.database",
  generic: "file.generic",
};

export function iconForKind(kind: EntryKind): IconName {
  return kindIcons[kind];
}
