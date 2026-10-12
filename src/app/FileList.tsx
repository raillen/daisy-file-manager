import { type MouseEvent, TextAttributes } from "@opentui/core";
import { For, Show } from "solid-js";

import type { Entry } from "../core/entries/directory";
import { formatBytes, formatDate } from "../core/format/units";
import type { Translator } from "../core/i18n/translator";
import { glyph, iconColor } from "../core/theme/icons";
import { iconForKind } from "../core/theme/kindIcons";
import type { Palette } from "../core/theme/palette";
import type { ClipboardState } from "../state/operations";

export type FileListProps = {
  palette: Palette;
  entries: Entry[];
  cursor: number;
  marked: string[];
  clipboard?: ClipboardState;
  iconSet: "nerd" | "unicode";
  locale: string;
  t: Translator;
  isActive?: boolean;
  onSelect?: (index: number) => void;
  onSelectRange?: (fromIndex: number, toIndex: number) => void;
  onToggleMark?: (path: string, index: number) => void;
  onOpen?: (entry: Entry) => void;
  onMoveCursor?: (delta: number) => void;
  onContextMenu?: (entry: Entry, index: number, x: number, y: number) => void;
};

export function FileList(props: FileListProps) {
  let lastClick = { index: -1, time: 0 };
  const isMarked = (entry: Entry) => props.marked.includes(entry.path);
  const isCut = (entry: Entry) => props.clipboard?.mode === "cut" && props.clipboard.paths.includes(entry.path);
  const isPaneActive = () => props.isActive !== false;

  const nameColor = (entry: Entry, index: number) => {
    if (index === props.cursor) {
      return isPaneActive() ? props.palette["bg.accent"] : props.palette["bg.selectedRow"];
    }
    if (isMarked(entry)) return props.palette["bg.accentMuted"];
    return undefined;
  };

  const textColor = (entry: Entry, index: number) => {
    if (index === props.cursor) {
      return isPaneActive() ? props.palette["fg.onEmphasis"] : props.palette["fg.default"];
    }
    if (isCut(entry)) return props.palette["fg.muted"];
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
        {(entry, index) => {
          const cut = () => isCut(entry);

          return (
            <box
              flexDirection="row"
              height={1}
              paddingLeft={1}
              paddingRight={1}
              backgroundColor={nameColor(entry, index())}
              onMouseDown={(event: MouseEvent) => {
                if (event.button === 2) {
                  props.onSelect?.(index());
                  props.onContextMenu?.(entry, index(), event.x, event.y);
                  return;
                }
                const now = Date.now();
                const isDouble = lastClick.index === index() && now - lastClick.time < 350;
                lastClick = { index: index(), time: now };

                if (isDouble) {
                  props.onOpen?.(entry);
                  return;
                }

                if (event.modifiers?.shift) {
                  props.onSelectRange?.(props.cursor, index());
                  return;
                }

                if (event.modifiers?.ctrl) {
                  props.onToggleMark?.(entry.path, index());
                  return;
                }

                props.onSelect?.(index());
              }}
              onMouseScroll={(event: MouseEvent) => {
                if (event.scroll?.direction === "up") props.onMoveCursor?.(-1);
                else if (event.scroll?.direction === "down") props.onMoveCursor?.(1);
              }}
            >
              <text fg={props.palette[iconColor(iconForKind(entry.isDirectory ? "directory" : entry.kind))]} width={2}>
                {glyph(iconForKind(entry.isDirectory ? "directory" : entry.kind), props.iconSet)}
              </text>

              <box flexGrow={1} paddingLeft={1} paddingRight={1} flexDirection="row">
                <Show when={cut()}>
                  <text fg={props.palette["fg.muted"]}>{"[✂] "}</text>
                </Show>
                <text
                  fg={textColor(entry, index())}
                  attributes={
                    index() === props.cursor ? TextAttributes.BOLD : cut() ? TextAttributes.ITALIC : TextAttributes.NONE
                  }
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
                <text
                  fg={
                    index() === props.cursor
                      ? isPaneActive()
                        ? props.palette["fg.onEmphasis"]
                        : props.palette["fg.default"]
                      : props.palette["fg.muted"]
                  }
                >
                  {formatDate(entry.modifiedMs, props.locale)}
                </text>
              </box>
            </box>
          );
        }}
      </For>
    </box>
  );
}
