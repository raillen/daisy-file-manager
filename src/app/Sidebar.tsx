import { basename } from "node:path";
import { type MouseEvent, TextAttributes } from "@opentui/core";
import { For, Show } from "solid-js";

import type { Translator } from "../core/i18n/translator";
import type { DriveDevice } from "../core/system/drives";
import type { IconSet } from "../core/theme/icons";
import { glyph } from "../core/theme/icons";
import type { Palette } from "../core/theme/palette";

export type Place = {
  key: string;
  icon: string;
  label: string;
  path: string;
};

export type SidebarProps = {
  palette: Palette;
  iconSet: IconSet;
  t: Translator;
  places: Place[];
  bookmarks?: string[];
  drives?: DriveDevice[];
  activePath: string;
  width?: number;
  onNavigate: (path: string) => void;
  onToggleBookmark?: (path: string) => void;
  onUnmountDrive?: (drive: DriveDevice) => void;
};

export function Sidebar(props: SidebarProps) {
  return (
    <box flexDirection="column" width={props.width ?? 22} paddingRight={1} backgroundColor={props.palette["bg.muted"]}>
      <box flexDirection="row" height={1} paddingLeft={1}>
        <text fg={props.palette["fg.muted"]} attributes={TextAttributes.BOLD}>
          {`01 // ${props.t("places.title")}`}
        </text>
      </box>

      <For each={props.places}>
        {(place) => {
          const active = () => place.path === props.activePath;
          return (
            <box flexDirection="row" height={1} paddingLeft={1} onMouseDown={() => props.onNavigate(place.path)}>
              <text fg={props.palette["fg.accent"]} width={2}>
                {glyph(place.icon, props.iconSet)}
              </text>
              <text
                fg={active() ? props.palette["fg.default"] : props.palette["fg.muted"]}
                attributes={active() ? TextAttributes.BOLD : TextAttributes.NONE}
              >
                {place.label}
              </text>
            </box>
          );
        }}
      </For>

      {/* Marcadores / Bookmarks */}
      <box flexDirection="row" height={1} paddingLeft={1} marginTop={1}>
        <text fg={props.palette["fg.muted"]} attributes={TextAttributes.BOLD}>
          {`02 // ${props.t("bookmarks.title")}`}
        </text>
      </box>

      <Show
        when={(props.bookmarks ?? []).length > 0}
        fallback={
          <box paddingLeft={1} height={1}>
            <text fg={props.palette["fg.muted"]}>{props.t("bookmarks.empty")}</text>
          </box>
        }
      >
        <For each={props.bookmarks}>
          {(bmPath) => {
            const active = () => bmPath === props.activePath;
            const name = () => basename(bmPath) || bmPath;
            return (
              <box
                flexDirection="row"
                height={1}
                paddingLeft={1}
                paddingRight={1}
                justifyContent="space-between"
                onMouseDown={() => props.onNavigate(bmPath)}
              >
                <box flexDirection="row" gap={1}>
                  <text fg={props.palette["fg.attention"]} width={2}>
                    {glyph("action.bookmark", props.iconSet)}
                  </text>
                  <text
                    fg={active() ? props.palette["fg.default"] : props.palette["fg.muted"]}
                    attributes={active() ? TextAttributes.BOLD : TextAttributes.NONE}
                  >
                    {name()}
                  </text>
                </box>
                <Show when={props.onToggleBookmark !== undefined}>
                  <box onMouseDown={() => props.onToggleBookmark?.(bmPath)}>
                    <text fg={props.palette["fg.muted"]}>✕</text>
                  </box>
                </Show>
              </box>
            );
          }}
        </For>
      </Show>

      {/* Dispositivos e Volumes / Drives */}
      <Show when={(props.drives ?? []).length > 0}>
        <box flexDirection="row" height={1} paddingLeft={1} marginTop={1}>
          <text fg={props.palette["fg.muted"]} attributes={TextAttributes.BOLD}>
            {`03 // ${props.t("drives.title")}`}
          </text>
        </box>

        <For each={props.drives}>
          {(drive) => {
            const active = () => drive.mountpoint === props.activePath;
            const iconName = () => (drive.isRemovable ? "ui.usb" : "ui.drive");
            return (
              <box
                flexDirection="row"
                height={1}
                paddingLeft={1}
                paddingRight={1}
                justifyContent="space-between"
                onMouseDown={() => props.onNavigate(drive.mountpoint)}
              >
                <box flexDirection="row" gap={1}>
                  <text fg={props.palette[drive.isRemovable ? "fg.accent" : "fg.muted"]} width={2}>
                    {glyph(iconName(), props.iconSet)}
                  </text>
                  <text
                    fg={active() ? props.palette["fg.default"] : props.palette["fg.muted"]}
                    attributes={active() ? TextAttributes.BOLD : TextAttributes.NONE}
                  >
                    {drive.label}
                  </text>
                </box>
                <Show when={drive.isRemovable && props.onUnmountDrive !== undefined}>
                  <box
                    onMouseDown={(e: MouseEvent) => {
                      e.stopPropagation?.();
                      props.onUnmountDrive?.(drive);
                    }}
                  >
                    <text fg={props.palette["fg.muted"]}>⏏</text>
                  </box>
                </Show>
              </box>
            );
          }}
        </For>
      </Show>
    </box>
  );
}
