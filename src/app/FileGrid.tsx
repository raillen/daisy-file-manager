import { type MouseEvent, TextAttributes } from "@opentui/core";
import { For } from "solid-js";

import type { Entry } from "../core/entries/directory";
import { glyph, type IconSet, iconColor } from "../core/theme/icons";
import { iconForKind } from "../core/theme/kindIcons";
import type { Palette } from "../core/theme/palette";
import type { ClipboardState } from "../state/operations";

export type FileGridProps = {
  palette: Palette;
  entries: Entry[];
  cursor: number;
  marked: string[];
  clipboard?: ClipboardState;
  iconSet: IconSet;
  columns: number;
  isActive?: boolean;
  onSelect?: (index: number) => void;
  onSelectRange?: (fromIndex: number, toIndex: number) => void;
  onToggleMark?: (path: string, index: number) => void;
  onOpen?: (entry: Entry) => void;
  onContextMenu?: (entry: Entry, index: number, x: number, y: number) => void;
};

export function FileGrid(props: FileGridProps) {
  let lastClick = { index: -1, time: 0 };
  const isMarked = (entry: Entry) => props.marked.includes(entry.path);
  const isCut = (entry: Entry) => props.clipboard?.mode === "cut" && props.clipboard.paths.includes(entry.path);
  const isPaneActive = () => props.isActive !== false;

  const tileBackground = (entry: Entry, index: number) => {
    if (index === props.cursor) {
      return isPaneActive() ? props.palette["bg.accent"] : props.palette["bg.selectedRow"];
    }
    if (isMarked(entry)) return props.palette["bg.accentMuted"];
    return undefined;
  };

  const labelColor = (entry: Entry, index: number) => {
    if (index === props.cursor) {
      return isPaneActive() ? props.palette["fg.onEmphasis"] : props.palette["fg.default"];
    }
    if (isCut(entry)) return props.palette["fg.muted"];
    if (entry.isDirectory) return props.palette["fg.directory"];
    return props.palette["fg.default"];
  };

  const tileWidth = () => (props.columns > 0 ? Math.floor(100 / props.columns) : 0);

  return (
    <box flexDirection="row" flexWrap="wrap" flexGrow={1} paddingLeft={1}>
      <For each={props.entries}>
        {(entry, index) => {
          const iconName = () => iconForKind(entry.isDirectory ? "directory" : entry.kind);
          const cut = () => isCut(entry);

          return (
            <box
              flexDirection="column"
              width={`${tileWidth()}%`}
              alignItems="center"
              paddingTop={1}
              backgroundColor={tileBackground(entry, index())}
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
            >
              <text fg={props.palette[iconColor(iconName())]}>{glyph(iconName(), props.iconSet)}</text>
              <text
                fg={labelColor(entry, index())}
                paddingTop={0}
                attributes={
                  index() === props.cursor ? TextAttributes.BOLD : cut() ? TextAttributes.ITALIC : TextAttributes.NONE
                }
              >
                {cut() ? `✂ ${entry.name}` : entry.name}
              </text>
            </box>
          );
        }}
      </For>
    </box>
  );
}
