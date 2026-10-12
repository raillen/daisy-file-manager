import type { Binding, Bindings } from "@opentui/keymap";

export type CommandName =
  | "nav.down"
  | "nav.up"
  | "nav.first"
  | "nav.last"
  | "nav.enter"
  | "nav.parent"
  | "select.toggle"
  | "select.visual"
  | "file.yank"
  | "file.cut"
  | "file.paste"
  | "file.trash"
  | "file.open"
  | "file.properties"
  | "file.mkdir"
  | "file.rename"
  | "file.newFile"
  | "file.extract"
  | "ui.commandLine"
  | "ui.search"
  | "ui.escape"
  | "ui.clear"
  | "view.toggle"
  | "view.hidden"
  | "view.splitPane"
  | "view.sidebar"
  | "view.preview"
  | "view.help"
  | "view.sort.name"
  | "view.sort.size"
  | "view.sort.modified"
  | "ui.quit";

export type BindingSpec = {
  command: CommandName;
  keys: string[];
};

export const defaultBindings: readonly BindingSpec[] = [
  { command: "nav.down", keys: ["j", "down"] },
  { command: "nav.up", keys: ["k", "up"] },
  { command: "nav.first", keys: ["g", "g"] },
  { command: "nav.last", keys: ["G"] },
  { command: "nav.enter", keys: ["l", "right", "return"] },
  { command: "nav.parent", keys: ["h", "left"] },
  { command: "select.toggle", keys: ["space"] },
  { command: "select.visual", keys: ["V"] },
  { command: "file.yank", keys: ["y"] },
  { command: "file.cut", keys: ["d"] },
  { command: "file.paste", keys: ["p"] },
  { command: "file.trash", keys: ["D"] },
  { command: "file.open", keys: ["o"] },
  { command: "file.properties", keys: ["i"] },
  { command: "file.mkdir", keys: ["ctrl+n"] },
  { command: "file.rename", keys: ["a"] },
  { command: "file.newFile", keys: ["ctrl+t"] },
  { command: "file.extract", keys: ["x"] },
  { command: "ui.commandLine", keys: [":"] },
  { command: "ui.search", keys: ["/"] },
  { command: "ui.escape", keys: ["escape"] },
  { command: "ui.clear", keys: ["ctrl+r"] },
  { command: "view.sort.name", keys: ["1"] },
  { command: "view.sort.size", keys: ["2"] },
  { command: "view.sort.modified", keys: ["3"] },
  { command: "view.toggle", keys: ["v"] },
  { command: "view.hidden", keys: ["ctrl+h"] },
  { command: "view.splitPane", keys: ["F3"] },
  { command: "view.sidebar", keys: ["ctrl+b"] },
  { command: "view.preview", keys: ["ctrl+p"] },
  { command: "view.help", keys: ["?"] },
  { command: "ui.quit", keys: ["q"] },
];

export type BindingOverrides = Record<string, string[]>;

function overridesFor(command: CommandName, overrides: BindingOverrides): string[] | undefined {
  return overrides[command];
}

export function buildBindings(overrides: BindingOverrides = {}): Bindings {
  const bindings: Binding[] = [];

  for (const spec of defaultBindings) {
    const keys = overridesFor(spec.command, overrides) ?? spec.keys;
    for (const key of keys) {
      bindings.push({ key, cmd: spec.command });
    }
  }

  return bindings;
}
