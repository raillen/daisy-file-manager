import { TextAttributes } from "@opentui/core";

import type { Palette } from "../core/theme/palette";

export type SearchBarProps = {
  palette: Palette;
  label: string;
  placeholder: string;
  onQuery: (value: string) => void;
  onSubmit: () => void;
};

export function SearchBar(props: SearchBarProps) {
  return (
    <box flexDirection="row" height={1} paddingLeft={1} backgroundColor={props.palette["bg.inset"]}>
      <text fg={props.palette["fg.accent"]} attributes={TextAttributes.BOLD}>
        {`${props.label} `}
      </text>
      <input
        focused
        flexGrow={1}
        placeholder={props.placeholder}
        backgroundColor={props.palette["bg.inset"]}
        textColor={props.palette["fg.default"]}
        cursorColor={props.palette["fg.accent"]}
        onInput={(value) => props.onQuery(value)}
        onSubmit={() => props.onSubmit()}
      />
    </box>
  );
}
