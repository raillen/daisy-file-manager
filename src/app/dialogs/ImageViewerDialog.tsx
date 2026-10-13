import { TextAttributes } from "@opentui/core";

import type { Entry } from "../../core/entries/directory";
import { formatBytes } from "../../core/format/units";
import type { Translator } from "../../core/i18n/translator";
import type { Palette } from "../../core/theme/palette";

export type ImageViewerDialogProps = {
  palette: Palette;
  entry: Entry;
  t: Translator;
  onClose: () => void;
};

export function ImageViewerDialog(props: ImageViewerDialogProps) {
  return (
    <box
      position="absolute"
      top="7%"
      left="7%"
      width="86%"
      height="86%"
      border
      borderColor={props.palette["border.focus"]}
      backgroundColor={props.palette["bg.overlay"]}
      padding={1}
      flexDirection="column"
    >
      <box flexDirection="row" justifyContent="space-between" height={1} marginBottom={1}>
        <box flexDirection="row">
          <text fg={props.palette["fg.accent"]} attributes={TextAttributes.BOLD}>
            {`✳ ${props.entry.name} `}
          </text>
          <text fg={props.palette["fg.muted"]}>{`(${formatBytes(props.entry.size, props.t)})`}</text>
        </box>
        <box flexDirection="row" gap={1}>
          <text fg={props.palette["fg.muted"]}>{"[ _ ] [ □ ] [ × ]"}</text>
          <text fg={props.palette["fg.muted"]}>{props.t("viewer.close")}</text>
        </box>
      </box>

      <box flexGrow={1} width="100%">
        <image source={props.entry.path} fit="fit" flexGrow={1} />
      </box>
    </box>
  );
}
