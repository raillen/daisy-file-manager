import { TextAttributes } from "@opentui/core";
import { useBindings } from "@opentui/keymap/solid";
import { createEffect, createSignal, Show } from "solid-js";

import type { Entry } from "../../core/entries/directory";
import { formatBytes } from "../../core/format/units";
import type { Translator } from "../../core/i18n/translator";
import { extractPdfText, hasPdfRenderer, renderPdfPage } from "../../core/pdf/pdf";
import { glyph, type IconSet } from "../../core/theme/icons";
import type { Palette } from "../../core/theme/palette";

export type PdfViewerDialogProps = {
  palette: Palette;
  iconSet: IconSet;
  entry: Entry;
  totalPages: number;
  initialPage?: number;
  t: Translator;
  onClose: () => void;
};

export function PdfViewerDialog(props: PdfViewerDialogProps) {
  const [page, setPage] = createSignal(Math.max(1, Math.min(props.initialPage ?? 1, props.totalPages)));
  const [mode, setMode] = createSignal<"visual" | "text">("visual");
  const [currentPng, setCurrentPng] = createSignal<string | undefined>(undefined);
  const [currentText, setCurrentText] = createSignal<string>("");
  const [hasRenderer, setHasRenderer] = createSignal<boolean>(true);

  createEffect(() => {
    void hasPdfRenderer().then((available) => {
      setHasRenderer(available);
      if (!available) {
        setMode("text");
      }
    });
  });

  createEffect(() => {
    const curPage = page();
    const curMode = mode();
    const filePath = props.entry.path;

    if (curMode === "visual" && hasRenderer()) {
      void renderPdfPage(filePath, curPage).then((png) => {
        setCurrentPng(png);
      });
    } else {
      void extractPdfText(filePath, curPage).then((txt) => {
        setCurrentText(txt);
      });
    }
  });

  function nextPage() {
    setPage((p) => Math.min(props.totalPages, p + 1));
  }

  function prevPage() {
    setPage((p) => Math.max(1, p - 1));
  }

  function firstPage() {
    setPage(1);
  }

  function lastPage() {
    setPage(props.totalPages);
  }

  function toggleMode() {
    setMode((m) => (m === "visual" ? "text" : "visual"));
  }

  try {
    useBindings(() => ({
      priority: 10,
      commands: [
        { name: "pdf.next", run: nextPage },
        { name: "pdf.prev", run: prevPage },
        { name: "pdf.first", run: firstPage },
        { name: "pdf.last", run: lastPage },
        { name: "pdf.toggle", run: toggleMode },
        { name: "pdf.close", run: props.onClose },
      ],
      bindings: [
        { key: "n", cmd: "pdf.next" },
        { key: "l", cmd: "pdf.next" },
        { key: "right", cmd: "pdf.next" },
        { key: "pagedown", cmd: "pdf.next" },
        { key: "p", cmd: "pdf.prev" },
        { key: "h", cmd: "pdf.prev" },
        { key: "left", cmd: "pdf.prev" },
        { key: "pageup", cmd: "pdf.prev" },
        { key: "g", cmd: "pdf.first" },
        { key: "home", cmd: "pdf.first" },
        { key: "shift+g", cmd: "pdf.last" },
        { key: "end", cmd: "pdf.last" },
        { key: "t", cmd: "pdf.toggle" },
        { key: "escape", cmd: "pdf.close" },
        { key: "q", cmd: "pdf.close" },
      ],
    }));
  } catch {
    // Keymap safe fallback
  }

  return (
    <box
      position="absolute"
      top="5%"
      left="5%"
      width="90%"
      height="90%"
      border
      borderColor={props.palette["border.focus"]}
      backgroundColor={props.palette["bg.overlay"]}
      padding={1}
      flexDirection="column"
    >
      <box flexDirection="row" justifyContent="space-between" height={1} marginBottom={1}>
        <box flexDirection="row">
          <text fg={props.palette["fg.accent"]} attributes={TextAttributes.BOLD}>
            {`${props.entry.name} `}
          </text>
          <text fg={props.palette["fg.muted"]}>{`(${formatBytes(props.entry.size, props.t)})`}</text>
        </box>

        <box flexDirection="row" gap={1}>
          <box paddingLeft={1} paddingRight={1} backgroundColor={props.palette["bg.inset"]} onMouseDown={prevPage}>
            <text fg={props.palette["fg.accent"]}>
              {`${glyph("nav.back", props.iconSet)} ${props.t("viewer.prevPage")}`}
            </text>
          </box>

          <box paddingLeft={1} paddingRight={1} backgroundColor={props.palette["bg.inset"]}>
            <text fg={props.palette["fg.default"]} attributes={TextAttributes.BOLD}>
              {props.t("viewer.pdfPage", {
                current: page(),
                total: props.totalPages,
              })}
            </text>
          </box>

          <box paddingLeft={1} paddingRight={1} backgroundColor={props.palette["bg.inset"]} onMouseDown={nextPage}>
            <text fg={props.palette["fg.accent"]}>
              {`${props.t("viewer.nextPage")} ${glyph("nav.forward", props.iconSet)}`}
            </text>
          </box>
        </box>

        <box flexDirection="row" gap={1}>
          <box paddingLeft={1} paddingRight={1} backgroundColor={props.palette["bg.inset"]} onMouseDown={toggleMode}>
            <text fg={props.palette["fg.accent"]}>
              {mode() === "visual" ? props.t("viewer.toggleText") : props.t("viewer.toggleVisual")}
            </text>
          </box>

          <box paddingLeft={1} paddingRight={1} backgroundColor={props.palette["bg.inset"]} onMouseDown={props.onClose}>
            <text fg={props.palette["fg.muted"]}>{props.t("viewer.close")}</text>
          </box>
        </box>
      </box>

      <Show when={!hasRenderer()}>
        <box height={1} marginBottom={1} backgroundColor={props.palette["bg.inset"]} paddingLeft={1}>
          <text fg={props.palette["fg.attention"]}>{props.t("viewer.noRenderer")}</text>
        </box>
      </Show>

      <Show
        when={mode() === "visual" && hasRenderer() && currentPng() !== undefined}
        fallback={
          <scrollbox
            flexGrow={1}
            width="100%"
            backgroundColor={props.palette["bg.inset"]}
            paddingLeft={1}
            paddingRight={1}
          >
            <text fg={props.palette["fg.default"]}>{currentText() || "—"}</text>
          </scrollbox>
        }
      >
        <box flexGrow={1} width="100%">
          <image source={currentPng() ?? ""} fit="fit" flexGrow={1} />
        </box>
      </Show>
    </box>
  );
}
