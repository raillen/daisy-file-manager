import { TextAttributes } from "@opentui/core";
import { createSignal } from "solid-js";

import type { Palette } from "../core/theme/palette";

export type CommandLineProps = {
  palette: Palette;
  prompt: string;
  placeholder: string;
  onExecute: (value: string) => void;
  onCancel: () => void;
};

export function CommandLine(props: CommandLineProps) {
  const [value, setValue] = createSignal("");

  function handleSubmit() {
    props.onExecute(value());
  }

  return (
    <box flexDirection="row" height={1} paddingLeft={1} backgroundColor={props.palette["bg.inset"]}>
      <text fg={props.palette["fg.accent"]} attributes={TextAttributes.BOLD}>
        {`${props.prompt} `}
      </text>
      <input
        focused
        flexGrow={1}
        placeholder={props.placeholder}
        backgroundColor={props.palette["bg.inset"]}
        textColor={props.palette["fg.default"]}
        cursorColor={props.palette["fg.accent"]}
        onInput={(val) => setValue(val)}
        onSubmit={handleSubmit}
      />
    </box>
  );
}
