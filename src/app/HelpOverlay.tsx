import { TextAttributes } from "@opentui/core";
import { For, Show } from "solid-js";

import { type CommandName, defaultBindings } from "../commands/bindings";
import type { Translator } from "../core/i18n/translator";
import type { Palette } from "../core/theme/palette";

export type HelpEntry = {
  command: CommandName;
  keys: string[];
};

export function helpEntries(overrides: Record<string, string[]> = {}): HelpEntry[] {
  return defaultBindings.map((spec) => ({
    command: spec.command,
    keys: overrides[spec.command] ?? spec.keys,
  }));
}

export type HelpOverlayProps = {
  open: boolean;
  palette: Palette;
  t: Translator;
  entries: HelpEntry[];
};

export function HelpOverlay(props: HelpOverlayProps) {
  return (
    <Show when={props.open}>
      <box
        position="absolute"
        top={2}
        left="10%"
        width="80%"
        height="80%"
        border
        borderColor={props.palette["border.focus"]}
        backgroundColor={props.palette["bg.overlay"]}
        padding={1}
        flexDirection="column"
      >
        <text fg={props.palette["fg.default"]} attributes={TextAttributes.BOLD}>
          {props.t("help.title")}
        </text>

        <For each={props.entries}>
          {(entry) => (
            <box flexDirection="row" marginTop={0}>
              <text fg={props.palette["fg.accent"]} width={24}>
                {entry.command}
              </text>
              <text fg={props.palette["fg.muted"]}>{entry.keys.join(", ")}</text>
            </box>
          )}
        </For>

        <text fg={props.palette["fg.muted"]} marginTop={1}>
          {props.t("help.pressClose")}
        </text>
      </box>
    </Show>
  );
}
