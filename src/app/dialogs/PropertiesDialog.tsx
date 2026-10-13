import { type MouseEvent, TextAttributes } from "@opentui/core";
import { useBindings } from "@opentui/keymap/solid";
import { For, Show } from "solid-js";
import type { Entry } from "../../core/entries/directory";
import { formatBytes, formatDate } from "../../core/format/units";
import type { Translator } from "../../core/i18n/translator";
import type { Palette } from "../../core/theme/palette";

export type PropertiesDialogProps = {
  palette: Palette;
  entry: Entry;
  locale: string;
  t: Translator;
  onClose: () => void;
};

export function PropertiesDialog(props: PropertiesDialogProps) {
  try {
    useBindings(() => ({
      priority: 10,
      commands: [{ name: "properties.close", run: props.onClose }],
      bindings: [
        { key: "escape", cmd: "properties.close" },
        { key: "q", cmd: "properties.close" },
        { key: "return", cmd: "properties.close" },
      ],
    }));
  } catch {
    // Keymap safe fallback
  }

  const rows = (): { label: string; value: string }[] => [
    { label: props.t("dialog.properties.name"), value: props.entry.name },
    { label: props.t("dialog.properties.path"), value: props.entry.path },
    { label: props.t("dialog.properties.kind"), value: props.entry.kind },
    { label: props.t("dialog.properties.size"), value: formatBytes(props.entry.size, props.t) },
    { label: props.t("dialog.properties.modified"), value: formatDate(props.entry.modifiedMs, props.locale) },
    { label: props.t("dialog.properties.permissions"), value: props.entry.permissions },
  ];

  return (
    <>
      {/* Full-screen backdrop capturing mouse clicks */}
      <box position="absolute" top={0} left={0} width="100%" height="100%" onMouseDown={props.onClose} />

      {/* Floating properties dialog */}
      <box
        position="absolute"
        top="15%"
        left="25%"
        width="50%"
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
          <text fg={props.palette["fg.accent"]} attributes={TextAttributes.BOLD}>
            {`✳ DAISY // ${props.t("dialog.properties.title").toLowerCase()}.exe`}
          </text>
          <box flexDirection="row" gap={1}>
            <text fg={props.palette["fg.muted"]}>{"[ _ ] [ □ ]"}</text>
            <box onMouseDown={() => props.onClose()}>
              <text fg={props.palette["fg.muted"]}>{"[ × ]"}</text>
            </box>
          </box>
        </box>

        <For each={rows()}>
          {(row) => (
            <box flexDirection="row" marginTop={0}>
              <text fg={props.palette["fg.muted"]} width={16}>
                {row.label}
              </text>
              <text fg={props.palette["fg.default"]}>{row.value}</text>
            </box>
          )}
        </For>

        <Show when={props.entry.isSymlink}>
          <text fg={props.palette["fg.symlink"]} marginTop={1}>
            {props.t("dialog.properties.links")}
          </text>
        </Show>

        <box flexDirection="row" justifyContent="space-between" marginTop={1}>
          <text fg={props.palette["fg.muted"]}>{`[Esc/q/Enter] ${props.t("viewer.close")}`}</text>
        </box>
      </box>
    </>
  );
}
