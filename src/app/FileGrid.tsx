import { For } from "solid-js";

import type { Entry } from "../core/entries/directory";
import { glyph, type IconSet, iconColor } from "../core/theme/icons";
import { iconForKind } from "../core/theme/kindIcons";
import type { Palette } from "../core/theme/palette";

export type FileGridProps = {
  palette: Palette;
  entries: Entry[];
  cursor: number;
  marked: string[];
  iconSet: IconSet;
  columns: number;
};

export function FileGrid(props: FileGridProps) {
  const isMarked = (entry: Entry) => props.marked.includes(entry.path);

  const tileBackground = (entry: Entry, index: number) => {
    if (index === props.cursor) return props.palette["bg.accent"];
    if (isMarked(entry)) return props.palette["bg.accentMuted"];
    return undefined;
  };

  const labelColor = (entry: Entry, index: number) => {
    if (index === props.cursor) return props.palette["fg.onEmphasis"];
    if (entry.isDirectory) return props.palette["fg.directory"];
    return props.palette["fg.default"];
  };

  const tileWidth = () => (props.columns > 0 ? Math.floor(100 / props.columns) : 0);

  return (
    <box flexDirection="row" flexWrap="wrap" flexGrow={1} paddingLeft={1}>
      <For each={props.entries}>
        {(entry, index) => {
          const iconName = () => iconForKind(entry.isDirectory ? "directory" : entry.kind);
          return (
            <box
              flexDirection="column"
              width={`${tileWidth()}%`}
              alignItems="center"
              paddingTop={1}
              backgroundColor={tileBackground(entry, index())}
            >
              <text fg={props.palette[iconColor(iconName())]}>{glyph(iconName(), props.iconSet)}</text>
              <text fg={labelColor(entry, index())} paddingTop={0}>
                {entry.name}
              </text>
            </box>
          );
        }}
      </For>
    </box>
  );
}
