import type { Binding, Bindings } from "@opentui/keymap";

export type CommandName =
  | "nav.down"
  | "nav.up"
  | "nav.first"
  | "nav.last"
  | "nav.enter"
  | "nav.parent"
  | "select.toggle"
  | "view.toggle"
  | "view.hidden"
  | "view.splitPane"
  | "view.sidebar"
  | "view.preview"
  | "view.help"
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
