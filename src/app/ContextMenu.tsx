import { type MouseEvent, TextAttributes } from "@opentui/core";
import { useBindings } from "@opentui/keymap/solid";
import { createSignal, For } from "solid-js";

import type { Entry } from "../core/entries/directory";
import type { Translator } from "../core/i18n/translator";
import { isArchive } from "../core/operations/archive";
import { glyph, type IconSet, iconColor } from "../core/theme/icons";
import type { Palette } from "../core/theme/palette";

export type ContextMenuProps = {
  palette: Palette;
  iconSet: IconSet;
  entry: Entry;
  x: number;
  y: number;
  terminalWidth?: number;
  terminalHeight?: number;
  isBookmarked: boolean;
  t: Translator;
  onOpen: () => void;
  onOpenWith: () => void;
  onRename: () => void;
  onCopy: () => void;
  onCut: () => void;
  onDelete: () => void;
  onBookmark: () => void;
  onExtract: () => void;
  onProperties: () => void;
  onClose: () => void;
};

export function ContextMenu(props: ContextMenuProps) {
  const [selectedIndex, setSelectedIndex] = createSignal(0);

  const items = () => {
    const list: {
      id: string;
      label: string;
      icon: string;
      shortcut: string;
      action: () => void;
    }[] = [
      {
        id: "open",
        label: props.t("contextMenu.open"),
        icon: "action.open",
        shortcut: "Enter",
        action: props.onOpen,
      },
      {
        id: "openWith",
        label: props.t("contextMenu.openWith"),
        icon: "action.openWith",
        shortcut: "",
        action: props.onOpenWith,
      },
      {
        id: "rename",
        label: props.t("contextMenu.rename"),
        icon: "action.rename",
        shortcut: "a",
        action: props.onRename,
      },
      {
        id: "copy",
        label: props.t("contextMenu.copy"),
        icon: "action.copy",
        shortcut: "y",
        action: props.onCopy,
      },
      {
        id: "cut",
        label: props.t("contextMenu.cut"),
        icon: "action.cut",
        shortcut: "d",
        action: props.onCut,
      },
      {
        id: "delete",
        label: props.t("contextMenu.delete"),
        icon: "action.delete",
        shortcut: "⇧D",
        action: props.onDelete,
      },
    ];

    if (props.entry.isDirectory) {
      list.push({
        id: "bookmark",
        label: props.isBookmarked ? props.t("contextMenu.unbookmark") : props.t("contextMenu.bookmark"),
        icon: "action.bookmark",
        shortcut: "b",
        action: props.onBookmark,
      });
    }

    if (isArchive(props.entry.name)) {
      list.push({
        id: "extract",
        label: props.t("contextMenu.extract"),
        icon: "action.extract",
        shortcut: "x",
        action: props.onExtract,
      });
    }

    list.push({
      id: "properties",
      label: props.t("contextMenu.properties"),
      icon: "action.properties",
      shortcut: "i",
      action: props.onProperties,
    });

    return list;
  };

  try {
    useBindings(() => ({
      priority: 20,
      commands: [
        {
          name: "contextMenu.up",
          run: () => setSelectedIndex((i) => (i > 0 ? i - 1 : items().length - 1)),
        },
        {
          name: "contextMenu.down",
          run: () => setSelectedIndex((i) => (i < items().length - 1 ? i + 1 : 0)),
        },
        {
          name: "contextMenu.confirm",
          run: () => {
            const current = items()[selectedIndex()];
            if (current) {
              current.action();
              props.onClose();
            }
          },
        },
        { name: "contextMenu.close", run: props.onClose },
        {
          name: "contextMenu.open",
          run: () => {
            props.onOpen();
            props.onClose();
          },
        },
        {
          name: "contextMenu.rename",
          run: () => {
            props.onRename();
            props.onClose();
          },
        },
        {
          name: "contextMenu.copy",
          run: () => {
            props.onCopy();
            props.onClose();
          },
        },
        {
          name: "contextMenu.cut",
          run: () => {
            props.onCut();
            props.onClose();
          },
        },
        {
          name: "contextMenu.delete",
          run: () => {
            props.onDelete();
            props.onClose();
          },
        },
        {
          name: "contextMenu.bookmark",
          run: () => {
            if (props.entry.isDirectory) {
              props.onBookmark();
              props.onClose();
            }
          },
        },
        {
          name: "contextMenu.extract",
          run: () => {
            if (isArchive(props.entry.name)) {
              props.onExtract();
              props.onClose();
            }
          },
        },
        {
          name: "contextMenu.properties",
          run: () => {
            props.onProperties();
            props.onClose();
          },
        },
      ],
      bindings: [
        { key: "up", cmd: "contextMenu.up" },
        { key: "k", cmd: "contextMenu.up" },
        { key: "down", cmd: "contextMenu.down" },
        { key: "j", cmd: "contextMenu.down" },
        { key: "return", cmd: "contextMenu.confirm" },
        { key: "escape", cmd: "contextMenu.close" },
        { key: "o", cmd: "contextMenu.open" },
        { key: "a", cmd: "contextMenu.rename" },
        { key: "y", cmd: "contextMenu.copy" },
        { key: "ctrl+c", cmd: "contextMenu.copy" },
        { key: "d", cmd: "contextMenu.cut" },
        { key: "ctrl+x", cmd: "contextMenu.cut" },
        { key: "shift+d", cmd: "contextMenu.delete" },
        { key: "b", cmd: "contextMenu.bookmark" },
        { key: "x", cmd: "contextMenu.extract" },
        { key: "i", cmd: "contextMenu.properties" },
      ],
    }));
  } catch {
    // Safe fallback outside KeymapProvider
  }

  const menuWidth = 30;
  const menuHeight = () => items().length + 2;
  const safeX = () => Math.max(0, Math.min(props.x, (props.terminalWidth ?? 80) - menuWidth - 1));
  const safeY = () => Math.max(0, Math.min(props.y, (props.terminalHeight ?? 24) - menuHeight() - 1));

  return (
    <>
      {/* Backdrop to capture outside clicks */}
      <box position="absolute" top={0} left={0} width="100%" height="100%" onMouseDown={props.onClose} />

      {/* Floating menu box */}
      <box
        position="absolute"
        top={safeY()}
        left={safeX()}
        width={menuWidth}
        border
        borderColor={props.palette["border.focus"]}
        backgroundColor={props.palette["bg.overlay"]}
        flexDirection="column"
      >
        <For each={items()}>
          {(item, index) => {
            const isSelected = () => index() === selectedIndex();

            return (
              <box
                height={1}
                flexDirection="row"
                justifyContent="space-between"
                paddingLeft={1}
                paddingRight={1}
                backgroundColor={isSelected() ? props.palette["bg.selectedRow"] : undefined}
                onMouseDown={(e: MouseEvent) => {
                  e.stopPropagation?.();
                  item.action();
                  props.onClose();
                }}
              >
                <box flexDirection="row">
                  <text fg={props.palette[iconColor(item.icon)]} width={2}>
                    {glyph(item.icon, props.iconSet)}
                  </text>
                  <text
                    fg={isSelected() ? props.palette["fg.accent"] : props.palette["fg.default"]}
                    attributes={isSelected() ? TextAttributes.BOLD : TextAttributes.NONE}
                  >
                    {item.label}
                  </text>
                </box>

                <text fg={props.palette["fg.muted"]}>{item.shortcut}</text>
              </box>
            );
          }}
        </For>
      </box>
    </>
  );
}
