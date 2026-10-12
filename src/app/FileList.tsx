import { TextAttributes } from "@opentui/core";
import { For, Show } from "solid-js";

import type { Entry } from "../core/entries/directory";
import { formatBytes, formatDate } from "../core/format/units";
import type { Translator } from "../core/i18n/translator";
import { glyph, iconColor } from "../core/theme/icons";
import { iconForKind } from "../core/theme/kindIcons";
import type { Palette } from "../core/theme/palette";

export type FileListProps = {
  palette: Palette;
  entries: Entry[];
  cursor: number;
  marked: string[];
  iconSet: "nerd" | "unicode";
  locale: string;
  t: Translator;
};

export function FileList(props: FileListProps) {
  const isMarked = (entry: Entry) => props.marked.includes(entry.path);

  const nameColor = (entry: Entry, index: number) => {
    if (index === props.cursor) return props.palette["bg.accent"];
    if (isMarked(entry)) return props.palette["bg.accentMuted"];
    return undefined;
  };

  const textColor = (entry: Entry, index: number) => {
    if (index === props.cursor) return props.palette["fg.onEmphasis"];
    if (entry.isDirectory) return props.palette["fg.directory"];
    if (entry.kind === "executable") return props.palette["fg.executable"];
    if (entry.isSymlink) return props.palette["fg.symlink"];
    if (entry.name.startsWith(".")) return props.palette["fg.hidden"];
    return props.palette["fg.default"];
  };

  return (
    <box flexDirection="column" flexGrow={1}>
      <Show when={props.entries.length === 0}>
        <text paddingLeft={1} fg={props.palette["fg.muted"]}>
          {props.t("list.empty")}
        </text>
      </Show>

      <For each={props.entries}>
        {(entry, index) => (
          <box
            flexDirection="row"
            height={1}
            paddingLeft={1}
            paddingRight={1}
            backgroundColor={nameColor(entry, index())}
          >
            <text fg={props.palette[iconColor(iconForKind(entry.isDirectory ? "directory" : entry.kind))]} width={2}>
              {glyph(iconForKind(entry.isDirectory ? "directory" : entry.kind), props.iconSet)}
            </text>

            <box flexGrow={1} paddingLeft={1} paddingRight={1}>
              <text
                fg={textColor(entry, index())}
                attributes={index() === props.cursor ? TextAttributes.BOLD : TextAttributes.NONE}
              >
                {entry.name}
              </text>
            </box>

            <box width={10} alignItems="flex-end">
              <Show when={!entry.isDirectory} fallback={<text fg={props.palette["fg.muted"]}>{"—"}</text>}>
                <text fg={textColor(entry, index())}>{formatBytes(entry.size, props.t)}</text>
              </Show>
            </box>

            <box width={18} alignItems="flex-end" paddingLeft={1}>
              <text fg={index() === props.cursor ? props.palette["fg.onEmphasis"] : props.palette["fg.muted"]}>
                {formatDate(entry.modifiedMs, props.locale)}
              </text>
            </box>
          </box>
        )}
      </For>
    </box>
  );
}
