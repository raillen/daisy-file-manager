import { type MouseEvent, TextAttributes } from "@opentui/core";
import { createSignal } from "solid-js";

import type { Translator } from "../../core/i18n/translator";
import type { Palette } from "../../core/theme/palette";
import type { InputDialogKind } from "../../state/ui";

export type InputDialogProps = {
  palette: Palette;
  kind: InputDialogKind;
  initialValue: string;
  t: Translator;
  onConfirm: (value: string) => void;
  onCancel: () => void;
};

function titleFor(kind: InputDialogKind, t: Translator): string {
  if (kind === "mkdir") return t("dialog.newFolder.title");
  if (kind === "rename") return t("dialog.rename.title");
  if (kind === "openWith") return t("dialog.openWith.title");
  return t("dialog.newFile.title");
}

function labelFor(kind: InputDialogKind, t: Translator): string {
  if (kind === "mkdir") return t("dialog.newFolder.label");
  if (kind === "rename") return t("dialog.rename.label");
  if (kind === "openWith") return t("dialog.openWith.label");
  return t("dialog.newFile.label");
}

export function InputDialog(props: InputDialogProps) {
  const [value, setValue] = createSignal(props.initialValue);

  function handleConfirm() {
    const trimmed = value().trim();
    if (trimmed !== "") props.onConfirm(trimmed);
  }

  return (
    <>
      {/* Full-screen backdrop capturing mouse clicks */}
      <box position="absolute" top={0} left={0} width="100%" height="100%" onMouseDown={props.onCancel} />

      <box
        position="absolute"
        top={4}
        left={8}
        width={48}
        border
        borderColor={props.palette["border.focus"]}
        backgroundColor={props.palette["bg.overlay"]}
        paddingLeft={1}
        paddingRight={1}
        flexDirection="column"
        onMouseDown={(e: MouseEvent) => {
          e.stopPropagation?.();
        }}
      >
        <box height={1} marginBottom={1}>
          <text fg={props.palette["fg.accent"]} attributes={TextAttributes.BOLD}>
            {titleFor(props.kind, props.t)}
          </text>
        </box>

        <box flexDirection="column" marginBottom={1}>
          <text fg={props.palette["fg.muted"]}>{labelFor(props.kind, props.t)}</text>
          <input
            focused
            width="100%"
            value={value()}
            backgroundColor={props.palette["bg.inset"]}
            textColor={props.palette["fg.default"]}
            cursorColor={props.palette["fg.accent"]}
            onInput={(val) => setValue(val)}
            onSubmit={handleConfirm}
          />
        </box>

        <box flexDirection="row" justifyContent="space-between" height={1}>
          <text fg={props.palette["fg.muted"]}>{`[Enter] ${props.t("dialog.confirm.yes")}`}</text>
          <text fg={props.palette["fg.muted"]}>{`[Esc] ${props.t("dialog.confirm.no")}`}</text>
        </box>
      </box>
    </>
  );
}
