import { type MouseEvent, type ScrollBoxRenderable, type SyntaxStyle, TextAttributes } from "@opentui/core";
import { useBindings } from "@opentui/keymap/solid";
import { Show } from "solid-js";

import type { Entry } from "../../core/entries/directory";
import { formatBytes } from "../../core/format/units";
import type { Translator } from "../../core/i18n/translator";
import type { Palette } from "../../core/theme/palette";

export type TextViewerDialogProps = {
  palette: Palette;
  entry: Entry;
  content: string;
  filetype: string;
  syntaxStyle: SyntaxStyle;
  t: Translator;
  onClose: () => void;
};

export function TextViewerDialog(props: TextViewerDialogProps) {
  let scrollBoxRef: ScrollBoxRenderable | null = null;
  const isMarkdown = () => props.filetype === "md" || props.filetype === "markdown";

  try {
    useBindings(() => ({
      priority: 10,
      commands: [
        { name: "viewer.close", run: props.onClose },
        { name: "viewer.scrollDown", run: () => scrollBoxRef?.scrollBy(3) },
        { name: "viewer.scrollUp", run: () => scrollBoxRef?.scrollBy(-3) },
        { name: "viewer.pageDown", run: () => scrollBoxRef?.scrollBy(12) },
        { name: "viewer.pageUp", run: () => scrollBoxRef?.scrollBy(-12) },
        {
          name: "viewer.top",
          run: () => {
            if (scrollBoxRef) scrollBoxRef.scrollTop = 0;
          },
        },
        {
          name: "viewer.bottom",
          run: () => {
            if (scrollBoxRef) scrollBoxRef.scrollTop = Number.MAX_SAFE_INTEGER;
          },
        },
      ],
      bindings: [
        { key: "escape", cmd: "viewer.close" },
        { key: "q", cmd: "viewer.close" },
        { key: "j", cmd: "viewer.scrollDown" },
        { key: "down", cmd: "viewer.scrollDown" },
        { key: "k", cmd: "viewer.scrollUp" },
        { key: "up", cmd: "viewer.scrollUp" },
        { key: "space", cmd: "viewer.pageDown" },
        { key: "pagedown", cmd: "viewer.pageDown" },
        { key: "pageup", cmd: "viewer.pageUp" },
        { key: "g", cmd: "viewer.top" },
        { key: "home", cmd: "viewer.top" },
        { key: "shift+g", cmd: "viewer.bottom" },
        { key: "end", cmd: "viewer.bottom" },
      ],
    }));
  } catch {
    // Keymap safe fallback
  }

  return (
    <>
      {/* Full-screen backdrop capturing mouse clicks */}
      <box position="absolute" top={0} left={0} width="100%" height="100%" onMouseDown={props.onClose} />

      {/* Floating viewer modal */}
      <box
        position="absolute"
        top="7%"
        left="7%"
        width="86%"
        height="86%"
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
          <box flexDirection="row">
            <text fg={props.palette["fg.accent"]} attributes={TextAttributes.BOLD}>
              {`${props.entry.name} `}
            </text>
            <text fg={props.palette["fg.muted"]}>
              {`(${props.filetype} · ${formatBytes(props.entry.size, props.t)})`}
            </text>
          </box>
          <box flexDirection="row" gap={1}>
            <text fg={props.palette["fg.muted"]}>{"[ _ ] [ □ ]"}</text>
            <box onMouseDown={() => props.onClose()}>
              <text fg={props.palette["fg.muted"]}>{"[ × ]"}</text>
            </box>
            <box onMouseDown={() => props.onClose()}>
              <text fg={props.palette["fg.muted"]}>{props.t("viewer.close")}</text>
            </box>
          </box>
        </box>

        <scrollbox
          ref={(el: ScrollBoxRenderable) => {
            scrollBoxRef = el;
          }}
          flexGrow={1}
          width="100%"
        >
          <Show
            when={isMarkdown()}
            fallback={<code content={props.content} filetype={props.filetype} syntaxStyle={props.syntaxStyle} />}
          >
            <markdown content={props.content} syntaxStyle={props.syntaxStyle} />
          </Show>
        </scrollbox>
      </box>
    </>
  );
}
