import { TextAttributes } from "@opentui/core";
import { For } from "solid-js";

import type { Translator } from "../core/i18n/translator";
import type { IconSet } from "../core/theme/icons";
import { glyph } from "../core/theme/icons";
import type { Palette } from "../core/theme/palette";

export type Place = {
  key: string;
  icon: string;
  label: string;
  path: string;
};

export type SidebarProps = {
  palette: Palette;
  iconSet: IconSet;
  t: Translator;
  places: Place[];
  activePath: string;
  onNavigate: (path: string) => void;
};

export function Sidebar(props: SidebarProps) {
  return (
    <box
      flexDirection="column"
      width={22}
      border={["right"]}
      paddingRight={1}
      backgroundColor={props.palette["bg.muted"]}
    >
      <box flexDirection="row" height={1} paddingLeft={1}>
        <text fg={props.palette["fg.muted"]} attributes={TextAttributes.BOLD}>
          {props.t("places.title")}
        </text>
      </box>

      <For each={props.places}>
        {(place) => {
          const active = () => place.path === props.activePath;
          return (
            <box flexDirection="row" height={1} paddingLeft={1} onMouseDown={() => props.onNavigate(place.path)}>
              <text fg={props.palette["fg.accent"]} width={2}>
                {glyph(place.icon, props.iconSet)}
              </text>
              <text
                fg={active() ? props.palette["fg.default"] : props.palette["fg.muted"]}
                attributes={active() ? TextAttributes.BOLD : TextAttributes.NONE}
              >
                {place.label}
              </text>
            </box>
          );
        }}
      </For>
    </box>
  );
}
