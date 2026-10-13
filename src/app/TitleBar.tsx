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
      {/* LED & Brand */}
      <box flexDirection="row" marginRight={1}>
        <text fg={props.palette["fg.accent"]} attributes={TextAttributes.BOLD}>
          {"● daisy "}
        </text>
        <text fg={props.palette["fg.muted"]}>{"// "}</text>
      </box>

      {/* Breadcrumbs */}
      <box flexDirection="row" flexGrow={1} paddingLeft={0} paddingRight={1}>
        <For each={props.segments}>
          {(segment, index) => (
            <>
              <text
                fg={index() === lastIndex() ? props.palette["fg.default"] : props.palette["fg.accent"]}
                attributes={index() === lastIndex() ? TextAttributes.BOLD : TextAttributes.NONE}
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

      {/* Query / Filter */}
      <Show when={props.query !== ""}>
        <text fg={props.palette["fg.accent"]}>{`/ ${props.query}`}</text>
      </Show>

      {/* Hint & Cyber Status Pill */}
      <Show when={props.query === "" && props.hint !== ""}>
        <text fg={props.palette["fg.muted"]}>{`${props.hint}`}</text>
      </Show>

      <box flexDirection="row" marginLeft={1}>
        <text fg={props.palette["fg.muted"]}>{" WIRED // SYS:98"}</text>
      </box>
    </box>
  );
}
