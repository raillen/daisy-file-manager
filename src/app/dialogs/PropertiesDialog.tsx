import { TextAttributes } from "@opentui/core";
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
  const rows = (): { label: string; value: string }[] => [
    { label: props.t("dialog.properties.name"), value: props.entry.name },
    { label: props.t("dialog.properties.path"), value: props.entry.path },
    { label: props.t("dialog.properties.kind"), value: props.entry.kind },
    { label: props.t("dialog.properties.size"), value: formatBytes(props.entry.size, props.t) },
    { label: props.t("dialog.properties.modified"), value: formatDate(props.entry.modifiedMs, props.locale) },
    { label: props.t("dialog.properties.permissions"), value: props.entry.permissions },
  ];

  return (
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
    >
      <text fg={props.palette["fg.default"]} attributes={TextAttributes.BOLD}>
        {props.t("dialog.properties.title")}
      </text>

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

      <text fg={props.palette["fg.muted"]} marginTop={1}>
        {`${props.t("dialog.confirm.no")}: esc`}
      </text>
    </box>
  );
}
