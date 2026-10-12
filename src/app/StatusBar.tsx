import { Show } from "solid-js";
import { formatBytes } from "../core/format/units";
import type { Translator } from "../core/i18n/translator";
import type { Palette } from "../core/theme/palette";

export type StatusBarProps = {
  palette: Palette;
  total: number;
  visible: number;
  marked: number;
  selectedSize: number | undefined;
  freeSpace: number | undefined;
  loading: boolean;
  message: string | undefined;
  t: Translator;
  hints: { key: string; label: string }[];
};

export function StatusBar(props: StatusBarProps) {
  const summary = () => {
    if (props.loading) return props.t("status.loading");
    const items = props.t("list.itemCount", { count: props.visible });
    if (props.total !== props.visible) {
      return `${items} ${props.t("list.truncated", { shown: props.visible, total: props.total })}`;
    }
    return items;
  };

  return (
    <box flexDirection="row" height={1} paddingLeft={1} paddingRight={1} backgroundColor={props.palette["bg.muted"]}>
      <text fg={props.palette["fg.default"]}>{summary()}</text>

      <Show when={props.marked > 0}>
        <text fg={props.palette["fg.accent"]}>{` · ${props.t("list.selectionCount", { count: props.marked })}`}</text>
      </Show>

      <Show when={props.selectedSize !== undefined}>
        <text fg={props.palette["fg.muted"]}>{` · ${formatBytes(props.selectedSize, props.t)}`}</text>
      </Show>

      <Show when={props.message !== undefined}>
        <text fg={props.palette["fg.attention"]}>{` · ${props.message}`}</text>
      </Show>

      <box flexGrow={1} />

      <Show when={props.freeSpace !== undefined}>
        <text fg={props.palette["fg.muted"]}>
          {props.t("status.freeSpace", { size: formatBytes(props.freeSpace, props.t) })}
        </text>
      </Show>

      <Show when={props.hints.length > 0}>
        <text
          fg={props.palette["fg.muted"]}
        >{`  ·  ${props.hints.map((hint) => `${hint.key} ${hint.label}`).join("  ")}`}</text>
      </Show>
    </box>
  );
}
