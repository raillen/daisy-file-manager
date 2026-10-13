import { type MouseEvent, TextAttributes } from "@opentui/core";
import { useBindings } from "@opentui/keymap/solid";

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
  try {
    useBindings(() => ({
      priority: 10,
      commands: [{ name: "imageViewer.close", run: props.onClose }],
      bindings: [
        { key: "escape", cmd: "imageViewer.close" },
        { key: "q", cmd: "imageViewer.close" },
      ],
    }));
  } catch {
    // Keymap safe fallback
  }

  return (
    <>
      {/* Full-screen backdrop capturing mouse clicks */}
      <box position="absolute" top={0} left={0} width="100%" height="100%" onMouseDown={props.onClose} />

      {/* Floating image viewer dialog */}
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
        onMouseDown={(e: MouseEvent) => {
          e.stopPropagation?.();
        }}
      >
        <box flexDirection="row" justifyContent="space-between" height={1} marginBottom={1}>
          <box flexDirection="row">
            <text fg={props.palette["fg.accent"]} attributes={TextAttributes.BOLD}>
              {`✳ ${props.entry.name} `}
            </text>
            <text fg={props.palette["fg.muted"]}>{`(${formatBytes(props.entry.size, props.t)})`}</text>
          </box>
          <box flexDirection="row" gap={1}>
            <text fg={props.palette["fg.muted"]}>{"[ _ ] [ □ ]"}</text>
            <box onMouseDown={() => props.onClose()}>
              <text fg={props.palette["fg.muted"]}>{"[ × ]"}</text>
            </box>
            <box onMouseDown={() => props.onClose()}>
              <text fg={props.palette["fg.muted"]}>{props.t("viewer.close")}</text>
            </box>
          </box>
        </box>

        <box flexGrow={1} width="100%">
          <image source={props.entry.path} fit="fit" flexGrow={1} />
        </box>
      </box>
    </>
  );
}
