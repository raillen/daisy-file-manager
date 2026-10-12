import { type MouseEvent, TextAttributes } from "@opentui/core";
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

const ZOOM_LEVELS = [50, 75, 100, 125, 150, 175, 200, 250, 300] as const;

export function PdfViewerDialog(props: PdfViewerDialogProps) {
  const [page, setPage] = createSignal(Math.max(1, Math.min(props.initialPage ?? 1, props.totalPages)));
  const [mode, setMode] = createSignal<"visual" | "text">("visual");
  const [zoom, setZoom] = createSignal<number>(100);
  const [isFit, setIsFit] = createSignal<boolean>(true);
  const [currentPng, setCurrentPng] = createSignal<string | undefined>(undefined);
  const [currentText, setCurrentText] = createSignal<string>("");
  const [hasRenderer, setHasRenderer] = createSignal<boolean>(true);

  const currentDpi = () => (isFit() ? 150 : Math.min(300, Math.max(72, Math.round(150 * (zoom() / 100)))));

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
    const dpi = currentDpi();
    const filePath = props.entry.path;

    if (hasRenderer()) {
      void renderPdfPage(filePath, curPage, dpi).then((png) => {
        if (png !== undefined) {
          setCurrentPng(png);
        }
      });
    }
    void extractPdfText(filePath, curPage).then((txt) => {
      setCurrentText(txt);
    });
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

  function zoomIn() {
    if (isFit()) {
      setIsFit(false);
      setZoom(125);
      return;
    }
    const cur = zoom();
    const next = ZOOM_LEVELS.find((lvl) => lvl > cur);
    if (next !== undefined) {
      setZoom(next);
    }
  }

  function zoomOut() {
    if (isFit()) {
      setIsFit(false);
      setZoom(75);
      return;
    }
    const cur = zoom();
    const prev = [...ZOOM_LEVELS].reverse().find((lvl) => lvl < cur);
    if (prev !== undefined) {
      setZoom(prev);
    }
  }

  function toggleFit() {
    if (isFit()) {
      setIsFit(false);
      setZoom(100);
    } else {
      setIsFit(true);
    }
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
        { name: "pdf.zoomIn", run: zoomIn },
        { name: "pdf.zoomOut", run: zoomOut },
        { name: "pdf.fit", run: toggleFit },
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
        { key: "ctrl++", cmd: "pdf.zoomIn" },
        { key: "ctrl+=", cmd: "pdf.zoomIn" },
        { key: "+", cmd: "pdf.zoomIn" },
        { key: "=", cmd: "pdf.zoomIn" },
        { key: "ctrl+-", cmd: "pdf.zoomOut" },
        { key: "-", cmd: "pdf.zoomOut" },
        { key: "f", cmd: "pdf.fit" },
        { key: "ctrl+0", cmd: "pdf.fit" },
        { key: "0", cmd: "pdf.fit" },
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
      top="3%"
      left="4%"
      width="92%"
      height="94%"
      border
      borderColor={props.palette["border.focus"]}
      backgroundColor={props.palette["bg.overlay"]}
      padding={1}
      flexDirection="column"
    >
      {/* Header: Title and Close button */}
      <box flexDirection="row" justifyContent="space-between" height={1} marginBottom={1}>
        <box flexDirection="row" gap={1}>
          <text fg={props.palette["fg.danger"]} attributes={TextAttributes.BOLD}>
            {`${glyph("file.pdf", props.iconSet)} `}
          </text>
          <text fg={props.palette["fg.default"]} attributes={TextAttributes.BOLD}>
            {props.entry.name}
          </text>
          <box paddingLeft={1} paddingRight={1} backgroundColor={props.palette["bg.inset"]}>
            <text fg={props.palette["fg.muted"]}>{formatBytes(props.entry.size, props.t)}</text>
          </box>
        </box>

        <box flexDirection="row" gap={1}>
          <box paddingLeft={1} paddingRight={1} backgroundColor={props.palette["bg.inset"]} onMouseDown={toggleMode}>
            <text fg={props.palette["fg.accent"]}>
              {mode() === "visual"
                ? `${glyph("file.text", props.iconSet)} ${props.t("viewer.toggleText")}`
                : `${glyph("view.preview", props.iconSet)} ${props.t("viewer.toggleVisual")}`}
            </text>
          </box>

          <box paddingLeft={1} paddingRight={1} backgroundColor={props.palette["bg.inset"]} onMouseDown={props.onClose}>
            <text fg={props.palette["fg.muted"]}>
              {`${glyph("action.cancel", props.iconSet)} ${props.t("viewer.close")}`}
            </text>
          </box>
        </box>
      </box>

      {/* Toolbar: Navigation and Controls */}
      <box flexDirection="row" justifyContent="space-between" height={1} marginBottom={1}>
        {/* Navigation buttons */}
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

        {/* Zoom and Fit buttons */}
        <Show when={mode() === "visual" && hasRenderer()}>
          <box flexDirection="row" gap={1}>
            <box
              paddingLeft={1}
              paddingRight={1}
              backgroundColor={props.palette["bg.inset"]}
              onMouseDown={zoomOut}
              onMouseScroll={(event: MouseEvent) => {
                if (event.scroll?.direction === "up") zoomIn();
                else if (event.scroll?.direction === "down") zoomOut();
              }}
            >
              <text fg={props.palette["fg.accent"]}>{glyph("action.zoomOut", props.iconSet)}</text>
            </box>

            <box
              paddingLeft={1}
              paddingRight={1}
              backgroundColor={props.palette["bg.inset"]}
              onMouseDown={toggleFit}
              onMouseScroll={(event: MouseEvent) => {
                if (event.scroll?.direction === "up") zoomIn();
                else if (event.scroll?.direction === "down") zoomOut();
              }}
            >
              <text fg={props.palette["fg.default"]} attributes={TextAttributes.BOLD}>
                {props.t("viewer.zoomLevel", { zoom: zoom() })}
              </text>
            </box>

            <box
              paddingLeft={1}
              paddingRight={1}
              backgroundColor={props.palette["bg.inset"]}
              onMouseDown={zoomIn}
              onMouseScroll={(event: MouseEvent) => {
                if (event.scroll?.direction === "up") zoomIn();
                else if (event.scroll?.direction === "down") zoomOut();
              }}
            >
              <text fg={props.palette["fg.accent"]}>{glyph("action.zoomIn", props.iconSet)}</text>
            </box>

            <box
              paddingLeft={1}
              paddingRight={1}
              backgroundColor={isFit() ? props.palette["bg.accent"] : props.palette["bg.inset"]}
              onMouseDown={toggleFit}
            >
              <text
                fg={isFit() ? props.palette["fg.onEmphasis"] : props.palette["fg.accent"]}
                attributes={isFit() ? TextAttributes.BOLD : TextAttributes.NONE}
              >
                {`${glyph("action.zoomFit", props.iconSet)} ${props.t("viewer.zoomFit")}`}
              </text>
            </box>
          </box>
        </Show>
      </box>

      <Show when={!hasRenderer()}>
        <box height={1} marginBottom={1} backgroundColor={props.palette["bg.inset"]} paddingLeft={1}>
          <text fg={props.palette["fg.attention"]}>{props.t("viewer.noRenderer")}</text>
        </box>
      </Show>

      {/* Main Content Viewer */}
      <Show
        when={mode() === "visual" && hasRenderer()}
        fallback={
          <scrollbox
            flexGrow={1}
            width="100%"
            backgroundColor={props.palette["bg.inset"]}
            paddingLeft={1}
            paddingRight={1}
          >
            <text fg={props.palette["fg.default"]}>
              {currentText() || (hasRenderer() ? props.t("status.loading") : props.t("viewer.noRenderer"))}
            </text>
          </scrollbox>
        }
      >
        <box
          flexGrow={1}
          width="100%"
          backgroundColor={props.palette["bg.inset"]}
          onMouseScroll={(event: MouseEvent) => {
            if (event.scroll?.direction === "up") zoomIn();
            else if (event.scroll?.direction === "down") zoomOut();
          }}
        >
          <Show
            when={currentPng() !== undefined}
            fallback={
              <box flexGrow={1} width="100%" alignItems="center" justifyContent="center">
                <text fg={props.palette["fg.muted"]}>{props.t("status.loading")}</text>
              </box>
            }
          >
            <image
              source={currentPng()}
              fit={isFit() ? "fit" : zoom() > 100 ? "cover" : "fit"}
              flexGrow={1}
              width="100%"
            />
          </Show>
        </box>
      </Show>

      {/* Footer: Shortcut Hints and Status */}
      <box
        flexDirection="row"
        justifyContent="space-between"
        height={1}
        marginTop={1}
        paddingLeft={1}
        paddingRight={1}
        backgroundColor={props.palette["bg.inset"]}
      >
        <text fg={props.palette["fg.muted"]}>{props.t("viewer.controlsHint")}</text>
        <Show when={mode() === "visual" && hasRenderer()}>
          <text fg={props.palette["fg.accent"]} attributes={TextAttributes.BOLD}>
            {isFit() ? props.t("viewer.statusFit") : props.t("viewer.statusZoom", { zoom: zoom(), dpi: currentDpi() })}
          </text>
        </Show>
      </box>
    </box>
  );
}
