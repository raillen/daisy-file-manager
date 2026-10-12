export type ExCommandKind =
  | "cd"
  | "mkdir"
  | "touch"
  | "trash"
  | "quit"
  | "theme"
  | "help"
  | "sort"
  | "view"
  | "unknown";

export type ParsedExCommand = {
  kind: ExCommandKind;
  raw: string;
  name: string;
  args: string[];
};

const knownCommands: Record<string, ExCommandKind> = {
  cd: "cd",
  mkdir: "mkdir",
  touch: "touch",
  rm: "trash",
  trash: "trash",
  q: "quit",
  quit: "quit",
  theme: "theme",
  help: "help",
  h: "help",
  sort: "sort",
  view: "view",
  v: "view",
};

export function parseExCommand(input: string): ParsedExCommand {
  const trimmed = input.trim();
  const withoutColon = trimmed.startsWith(":") ? trimmed.slice(1).trim() : trimmed;

  if (withoutColon === "") {
    return {
      kind: "unknown",
      raw: input,
      name: "",
      args: [],
    };
  }

  const parts = withoutColon.split(/\s+/);
  const name = parts[0]?.toLowerCase() ?? "";
  const args = parts.slice(1);
  const kind = knownCommands[name] ?? "unknown";

  return {
    kind,
    raw: input,
    name,
    args,
  };
}
