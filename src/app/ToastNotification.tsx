import { basename } from "node:path";

import { TextAttributes } from "@opentui/core";
import { Show } from "solid-js";

import type { Translator } from "../core/i18n/translator";
import { glyph, type IconSet } from "../core/theme/icons";
import type { Palette } from "../core/theme/palette";
import type { QueueState } from "../state/operations";

export type ToastNotificationProps = {
  palette: Palette;
  iconSet: IconSet;
  queue: QueueState;
  t: Translator;
};

export function ToastNotification(props: ToastNotificationProps) {
  const isVisible = () => props.queue.running || props.queue.message !== undefined || props.queue.error !== undefined;

  const percent = () => {
    const p = props.queue.progress;
    if (!p || p.total <= 0) return 0;
    return Math.min(100, Math.round((p.current / p.total) * 100));
  };

  const progressBar = () => {
    const totalBars = 20;
    const filled = Math.min(totalBars, Math.round((percent() / 100) * totalBars));
    const empty = Math.max(0, totalBars - filled);
    return `[${"█".repeat(filled)}${"░".repeat(empty)}]`;
  };

  return (
    <Show when={isVisible()}>
      <box
        position="absolute"
        bottom={2}
        right={2}
        width={44}
        border
        borderColor={props.queue.error ? props.palette["fg.danger"] : props.palette["border.focus"]}
        backgroundColor={props.palette["bg.overlay"]}
        paddingLeft={1}
        paddingRight={1}
        flexDirection="column"
      >
        <Show when={props.queue.running && props.queue.progress !== undefined}>
          <box flexDirection="row" justifyContent="space-between">
            <text fg={props.palette["fg.accent"]} attributes={TextAttributes.BOLD}>
              {props.t("progress.title")}
            </text>
            <text fg={props.palette["fg.accent"]} attributes={TextAttributes.BOLD}>
              {`${percent()}%`}
            </text>
          </box>

          <box flexDirection="row" marginTop={0}>
            <text fg={props.palette["fg.accent"]}>{progressBar()}</text>
          </box>

          <box flexDirection="row" marginTop={0}>
            <text fg={props.palette["fg.muted"]}>
              {`${props.queue.progress?.current ?? 0}/${props.queue.progress?.total ?? 0} · ${basename(props.queue.progress?.path ?? "")}`}
            </text>
          </box>
        </Show>

        <Show when={!props.queue.running && props.queue.message !== undefined}>
          <box flexDirection="row">
            <text fg={props.palette["fg.accent"]} attributes={TextAttributes.BOLD}>
              {`${glyph("status.success", props.iconSet)} `}
            </text>
            <text fg={props.palette["fg.default"]}>{props.queue.message}</text>
          </box>
        </Show>

        <Show when={!props.queue.running && props.queue.error !== undefined}>
          <box flexDirection="row">
            <text fg={props.palette["fg.danger"]} attributes={TextAttributes.BOLD}>
              {`${glyph("status.error", props.iconSet)} `}
            </text>
            <text fg={props.palette["fg.danger"]}>{props.queue.error}</text>
          </box>
        </Show>
      </box>
    </Show>
  );
}
