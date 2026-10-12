import type { MouseEvent } from "@opentui/core";
import { createSignal } from "solid-js";

import type { Palette } from "../core/theme/palette";

export type ResizerProps = {
  palette: Palette;
  onDrag: (x: number) => void;
  onStartDrag?: (x: number) => void;
  onEndDrag?: () => void;
};

export function Resizer(props: ResizerProps) {
  const [dragging, setDragging] = createSignal(false);

  return (
    <box
      width={1}
      backgroundColor={dragging() ? props.palette["bg.accentMuted"] : props.palette["bg.default"]}
      onMouseDown={(e: MouseEvent) => {
        setDragging(true);
        props.onStartDrag?.(e.x);
        props.onDrag(e.x);
      }}
      onMouseDrag={(e: MouseEvent) => {
        setDragging(true);
        props.onDrag(e.x);
      }}
      onMouseDragEnd={() => {
        setDragging(false);
        props.onEndDrag?.();
      }}
      onMouseUp={() => {
        setDragging(false);
        props.onEndDrag?.();
      }}
    >
      <text fg={dragging() ? props.palette["fg.accent"] : props.palette["fg.muted"]}>{"│"}</text>
    </box>
  );
}
