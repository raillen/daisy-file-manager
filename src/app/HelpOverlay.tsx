import { TextAttributes } from "@opentui/core";
import { useTerminalDimensions } from "@opentui/solid";
import { createMemo, For, Show } from "solid-js";

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
  const dimensions = useTerminalDimensions();
  const isWide = createMemo(() => dimensions().width >= 90);

  const midpoint = createMemo(() => Math.ceil(props.entries.length / 2));
  const leftColumn = createMemo(() => props.entries.slice(0, midpoint()));
  const rightColumn = createMemo(() => props.entries.slice(midpoint()));

  return (
    <Show when={props.open}>
      <box
        position="absolute"
        top="5%"
        left="5%"
        width="90%"
        height="90%"
        border
        borderColor={props.palette["border.focus"]}
        backgroundColor={props.palette["bg.overlay"]}
        padding={1}
        flexDirection="column"
      >
        <box flexDirection="row" justifyContent="space-between" height={1} marginBottom={1} flexShrink={0}>
          <box flexDirection="row">
            <text fg={props.palette["fg.accent"]} attributes={TextAttributes.BOLD}>
              {`✳ DAISY // ${props.t("help.title").toLowerCase()}.txt `}
            </text>
          </box>
          <box flexDirection="row" gap={1}>
            <text fg={props.palette["fg.muted"]}>{"[ _ ] [ □ ] [ × ]"}</text>
            <text fg={props.palette["fg.muted"]}>{props.t("help.pressClose")}</text>
          </box>
        </box>

        <scrollbox flexGrow={1} width="100%">
          <Show
            when={isWide()}
            fallback={
              <box flexDirection="column">
                <For each={props.entries}>
                  {(entry) => (
                    <box flexDirection="row" height={1} flexShrink={0}>
                      <text fg={props.palette["fg.accent"]} width={24}>
                        {entry.command}
                      </text>
                      <text fg={props.palette["fg.default"]}>{entry.keys.join(", ")}</text>
                    </box>
                  )}
                </For>
              </box>
            }
          >
            <box flexDirection="row" width="100%" gap={2}>
              <box flexDirection="column" width="50%">
                <For each={leftColumn()}>
                  {(entry) => (
                    <box flexDirection="row" height={1} flexShrink={0}>
                      <text fg={props.palette["fg.accent"]} width={22}>
                        {entry.command}
                      </text>
                      <text fg={props.palette["fg.default"]}>{entry.keys.join(", ")}</text>
                    </box>
                  )}
                </For>
              </box>
              <box flexDirection="column" width="50%">
                <For each={rightColumn()}>
                  {(entry) => (
                    <box flexDirection="row" height={1} flexShrink={0}>
                      <text fg={props.palette["fg.accent"]} width={22}>
                        {entry.command}
                      </text>
                      <text fg={props.palette["fg.default"]}>{entry.keys.join(", ")}</text>
                    </box>
                  )}
                </For>
              </box>
            </box>
          </Show>
        </scrollbox>
      </box>
    </Show>
  );
}
