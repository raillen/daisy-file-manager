import { TextAttributes } from "@opentui/core";
import { For, Show } from "solid-js";

import type { BreadcrumbSegment } from "../core/entries/path";
import type { Palette } from "../core/theme/palette";

export type TitleBarProps = {
  palette: Palette;
  segments: BreadcrumbSegment[];
  separator: string;
  query: string;
  hint: string;
  onNavigate: (path: string) => void;
};

export function TitleBar(props: TitleBarProps) {
  const lastIndex = () => props.segments.length - 1;

  return (
    <box flexDirection="row" height={1} paddingLeft={1} paddingRight={1} backgroundColor={props.palette["bg.muted"]}>
      <text fg={props.palette["fg.accent"]} attributes={TextAttributes.BOLD}>
        {"daisy"}
      </text>

      <box flexDirection="row" flexGrow={1} paddingLeft={1} paddingRight={1}>
        <For each={props.segments}>
          {(segment, index) => (
            <>
              <text
                fg={index() === lastIndex() ? props.palette["fg.default"] : props.palette["fg.accent"]}
                onMouseDown={() => props.onNavigate(segment.path)}
              >
                {segment.name}
              </text>
              <Show when={index() < lastIndex()}>
                <text fg={props.palette["fg.muted"]}>{` ${props.separator} `}</text>
              </Show>
            </>
          )}
        </For>
      </box>

      <Show when={props.query !== ""}>
        <text fg={props.palette["fg.muted"]}>{`/ ${props.query}`}</text>
      </Show>
      <Show when={props.query === "" && props.hint !== ""}>
        <text fg={props.palette["fg.muted"]}>{`${props.hint}`}</text>
      </Show>
    </box>
  );
}
