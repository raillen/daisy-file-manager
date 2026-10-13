import type { MouseEvent } from "@opentui/core";
import { useBindings } from "@opentui/keymap/solid";
import { createEffect, createSignal, For } from "solid-js";

import type { Entry } from "../../core/entries/directory";
import { readDirectory } from "../../core/entries/directory";
import { parentOf } from "../../core/entries/path";
import type { Translator } from "../../core/i18n/translator";
import { glyph, type IconSet } from "../../core/theme/icons";
import type { Palette } from "../../core/theme/palette";
import type { Place } from "../Sidebar";

export type TargetFolderDialogProps = {
  palette: Palette;
  iconSet: IconSet;
  mode: "copy" | "move";
  sources: string[];
  initialDirectory: string;
  places: Place[];
  t: Translator;
  onConfirm: (destinationPath: string) => void;
  onCancel: () => void;
};

export function TargetFolderDialog(props: TargetFolderDialogProps) {
  const [currentPath, setCurrentPath] = createSignal(props.initialDirectory);
  const [subfolders, setSubfolders] = createSignal<Entry[]>([]);
  const [cursor, setCursor] = createSignal(0);

  async function loadFolders(dir: string) {
    try {
      const entries = await readDirectory(dir);
      const dirs = entries.filter((e) => e.isDirectory && !e.name.startsWith("."));
      setSubfolders(dirs);
      setCursor(0);
    } catch {
      setSubfolders([]);
    }
  }

  createEffect(() => {
    void loadFolders(currentPath());
  });

  function goUp() {
    const parent = parentOf(currentPath());
    if (parent !== null) {
      setCurrentPath(parent);
    }
  }

  function handleEnter() {
    const folders = subfolders();
    const idx = cursor();

    // Index 0 is "Confirm current folder"
    if (idx === 0) {
      props.onConfirm(currentPath());
      return;
    }

    // Index 1 is ".. (Parent folder)"
    if (idx === 1) {
      goUp();
      return;
    }

    // Index 2+ is a subfolder
    const folder = folders[idx - 2];
    if (folder !== undefined) {
      setCurrentPath(folder.path);
    }
  }

  function totalItems() {
    return subfolders().length + 2; // [0: current, 1: parent, 2+: folders]
  }

  function moveCursor(delta: number) {
    const total = totalItems();
    if (total === 0) return;
    setCursor((c) => Math.max(0, Math.min(c + delta, total - 1)));
  }

  try {
    useBindings(() => ({
      priority: 10,
      commands: [
        { name: "folder.down", run: () => moveCursor(1) },
        { name: "folder.up", run: () => moveCursor(-1) },
        { name: "folder.enter", run: handleEnter },
        { name: "folder.parent", run: goUp },
        { name: "folder.confirm", run: () => props.onConfirm(currentPath()) },
        { name: "folder.cancel", run: props.onCancel },
      ],
      bindings: [
        { key: "j", cmd: "folder.down" },
        { key: "down", cmd: "folder.down" },
        { key: "k", cmd: "folder.up" },
        { key: "up", cmd: "folder.up" },
        { key: "return", cmd: "folder.enter" },
        { key: "l", cmd: "folder.enter" },
        { key: "h", cmd: "folder.parent" },
        { key: "backspace", cmd: "folder.parent" },
        { key: "space", cmd: "folder.confirm" },
        { key: "escape", cmd: "folder.cancel" },
      ],
    }));
  } catch {
    // KeymapProvider not present in isolated test renders
  }

  const title = () =>
    props.mode === "copy"
      ? props.t("targetFolder.copyTitle", { count: props.sources.length })
      : props.t("targetFolder.moveTitle", { count: props.sources.length });

  let lastClick = { index: -1, time: 0 };

  return (
    <>
      {/* Full-screen backdrop capturing mouse clicks */}
      <box position="absolute" top={0} left={0} width="100%" height="100%" onMouseDown={props.onCancel} />

      <box
        position="absolute"
        top="10%"
        left="10%"
        width="80%"
        height="80%"
        border
        borderColor={props.palette["border.focus"]}
        backgroundColor={props.palette["bg.overlay"]}
        paddingLeft={1}
        paddingRight={1}
        flexDirection="column"
        onMouseDown={(e: MouseEvent) => {
          e.stopPropagation?.();
        }}
      >
        <box height={1} marginBottom={1} flexDirection="row" justifyContent="space-between">
          <text fg={props.palette["fg.accent"]}>{title()}</text>
          <text fg={props.palette["fg.muted"]}>{props.t("targetFolder.hint")}</text>
        </box>

        <box height={1} marginBottom={1} backgroundColor={props.palette["bg.inset"]} paddingLeft={1}>
          <text fg={props.palette["fg.default"]}>{props.t("targetFolder.current", { path: currentPath() })}</text>
        </box>

        <box flexDirection="row" height={1} marginBottom={1} gap={1}>
          <For each={props.places}>
            {(place) => (
              <box
                paddingLeft={1}
                paddingRight={1}
                backgroundColor={place.path === currentPath() ? props.palette["bg.accent"] : props.palette["bg.inset"]}
                onMouseDown={() => setCurrentPath(place.path)}
              >
                <text fg={place.path === currentPath() ? props.palette["fg.onEmphasis"] : props.palette["fg.default"]}>
                  {place.label}
                </text>
              </box>
            )}
          </For>
        </box>

        <scrollbox flexGrow={1} width="100%">
          <box
            height={1}
            paddingLeft={1}
            backgroundColor={cursor() === 0 ? props.palette["bg.accent"] : undefined}
            onMouseDown={() => {
              setCursor(0);
              props.onConfirm(currentPath());
            }}
          >
            <text fg={cursor() === 0 ? props.palette["fg.onEmphasis"] : props.palette["fg.accent"]}>
              {`${glyph("action.confirm", props.iconSet)} ${props.t("targetFolder.useCurrent", { path: currentPath() })}`}
            </text>
          </box>

          <box
            height={1}
            paddingLeft={1}
            backgroundColor={cursor() === 1 ? props.palette["bg.accent"] : undefined}
            onMouseDown={() => {
              setCursor(1);
              goUp();
            }}
          >
            <text fg={cursor() === 1 ? props.palette["fg.onEmphasis"] : props.palette["fg.muted"]}>
              {`${glyph("nav.parent", props.iconSet)} ${props.t("targetFolder.parent")}`}
            </text>
          </box>

          <For each={subfolders()}>
            {(folder, i) => {
              const itemIdx = () => i() + 2;
              const isSelected = () => cursor() === itemIdx();

              return (
                <box
                  height={1}
                  paddingLeft={1}
                  backgroundColor={isSelected() ? props.palette["bg.accent"] : undefined}
                  onMouseDown={() => {
                    const now = Date.now();
                    const isDouble = lastClick.index === itemIdx() && now - lastClick.time < 350;
                    lastClick = { index: itemIdx(), time: now };

                    setCursor(itemIdx());
                    if (isDouble) {
                      setCurrentPath(folder.path);
                    }
                  }}
                >
                  <text fg={isSelected() ? props.palette["fg.onEmphasis"] : props.palette["fg.directory"]}>
                    {`${glyph("file.directory", props.iconSet)} ${folder.name}`}
                  </text>
                </box>
              );
            }}
          </For>
        </scrollbox>

        <box height={1} marginTop={1} flexDirection="row" justifyContent="flex-end" gap={2}>
          <box
            paddingLeft={2}
            paddingRight={2}
            backgroundColor={props.palette["bg.inset"]}
            onMouseDown={props.onCancel}
          >
            <text fg={props.palette["fg.muted"]}>{props.t("targetFolder.cancelButton")}</text>
          </box>

          <box
            paddingLeft={2}
            paddingRight={2}
            backgroundColor={props.palette["bg.accent"]}
            onMouseDown={() => props.onConfirm(currentPath())}
          >
            <text fg={props.palette["fg.onEmphasis"]}>{props.t("targetFolder.confirmButton")}</text>
          </box>
        </box>
      </box>
    </>
  );
}
