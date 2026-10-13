import { type MouseEvent, TextAttributes } from "@opentui/core";
import { useBindings } from "@opentui/keymap/solid";
import { createSignal, For } from "solid-js";
import type { Translator } from "../../core/i18n/translator";
import type { Palette, ThemeName } from "../../core/theme/palette";

export type ThemeSelectorDialogProps = {
  palette: Palette;
  currentTheme: ThemeName;
  t: Translator;
  onPreview: (theme: ThemeName) => void;
  onConfirm: (theme: ThemeName) => void;
  onCancel: () => void;
};

type ThemeMeta = {
  id: ThemeName;
  key: string;
  swatches: string[];
};

const THEME_OPTIONS: readonly ThemeMeta[] = [
  {
    id: "dark",
    key: "dark",
    swatches: ["#0d1117", "#161b22", "#1f6feb", "#58a6ff"],
  },
  {
    id: "wired",
    key: "wired",
    swatches: ["#070913", "#00126b", "#ffe500", "#67f4ed"],
  },
  {
    id: "cyberpunk",
    key: "cyberpunk",
    swatches: ["#0e071e", "#1c0d38", "#ff2a85", "#00f0ff"],
  },
  {
    id: "retro",
    key: "retro",
    swatches: ["#f1eee9", "#e4dfd6", "#11379f", "#ffe634"],
  },
  {
    id: "light",
    key: "light",
    swatches: ["#ffffff", "#f6f8fa", "#0969da", "#1f2328"],
  },
];

export function ThemeSelectorDialog(props: ThemeSelectorDialogProps) {
  const initialTheme = props.currentTheme;
  const initialIndex = Math.max(
    0,
    THEME_OPTIONS.findIndex((opt) => opt.id === initialTheme),
  );
  const [cursor, setCursor] = createSignal(initialIndex);

  function moveTo(index: number) {
    const clamped = Math.max(0, Math.min(index, THEME_OPTIONS.length - 1));
    setCursor(clamped);
    const chosen = THEME_OPTIONS[clamped];
    if (chosen) {
      props.onPreview(chosen.id);
    }
  }

  function handleConfirm() {
    const chosen = THEME_OPTIONS[cursor()];
    if (chosen) {
      props.onConfirm(chosen.id);
    }
  }

  function handleCancel() {
    props.onPreview(initialTheme);
    props.onCancel();
  }

  try {
    useBindings(() => ({
      priority: 15,
      commands: [
        { name: "theme.down", run: () => moveTo(cursor() + 1) },
        { name: "theme.up", run: () => moveTo(cursor() - 1) },
        { name: "theme.confirm", run: handleConfirm },
        { name: "theme.cancel", run: handleCancel },
        {
          name: "theme.pick1",
          run: () => {
            moveTo(0);
            handleConfirm();
          },
        },
        {
          name: "theme.pick2",
          run: () => {
            moveTo(1);
            handleConfirm();
          },
        },
        {
          name: "theme.pick3",
          run: () => {
            moveTo(2);
            handleConfirm();
          },
        },
        {
          name: "theme.pick4",
          run: () => {
            moveTo(3);
            handleConfirm();
          },
        },
        {
          name: "theme.pick5",
          run: () => {
            moveTo(4);
            handleConfirm();
          },
        },
      ],
      bindings: [
        { key: "j", cmd: "theme.down" },
        { key: "down", cmd: "theme.down" },
        { key: "k", cmd: "theme.up" },
        { key: "up", cmd: "theme.up" },
        { key: "return", cmd: "theme.confirm" },
        { key: "space", cmd: "theme.confirm" },
        { key: "escape", cmd: "theme.cancel" },
        { key: "q", cmd: "theme.cancel" },
        { key: "1", cmd: "theme.pick1" },
        { key: "2", cmd: "theme.pick2" },
        { key: "3", cmd: "theme.pick3" },
        { key: "4", cmd: "theme.pick4" },
        { key: "5", cmd: "theme.pick5" },
      ],
    }));
  } catch {
    // KeymapProvider not present in unit test render
  }

  return (
    <>
      {/* Full-screen backdrop capturing mouse clicks */}
      <box position="absolute" top={0} left={0} width="100%" height="100%" onMouseDown={handleCancel} />

      <box
        position="absolute"
        top="12%"
        left="18%"
        width="64%"
        border
        borderColor={props.palette["border.focus"]}
        backgroundColor={props.palette["bg.overlay"]}
        padding={1}
        flexDirection="column"
        onMouseDown={(e: MouseEvent) => {
          e.stopPropagation?.();
        }}
      >
        {/* Retro Titlebar */}
        <box flexDirection="row" justifyContent="space-between" height={1} marginBottom={1}>
          <text fg={props.palette["fg.accent"]} attributes={TextAttributes.BOLD}>
            {"✳ DAISY // themes.exe "}
          </text>
          <box flexDirection="row" gap={1}>
            <text fg={props.palette["fg.muted"]}>{"[ _ ] [ □ ]"}</text>
            <text fg={props.palette["fg.muted"]} onMouseDown={handleCancel}>
              {"[Esc]"}
            </text>
          </box>
        </box>

        {/* Theme List */}
        <box flexDirection="column" gap={0}>
          <For each={THEME_OPTIONS}>
            {(option, index) => {
              const isSelected = () => index() === cursor();
              const isCurrent = () => option.id === initialTheme;
              const name = () => props.t(`themeSelector.themes.${option.key}.name`);
              const desc = () => props.t(`themeSelector.themes.${option.key}.description`);

              return (
                <box
                  flexDirection="row"
                  height={2}
                  paddingLeft={1}
                  paddingRight={1}
                  alignItems="center"
                  backgroundColor={isSelected() ? props.palette["bg.selectedRow"] : undefined}
                  onMouseDown={() => {
                    moveTo(index());
                    handleConfirm();
                  }}
                >
                  {/* Radio / Index */}
                  <text
                    fg={isSelected() ? props.palette["fg.accent"] : props.palette["fg.muted"]}
                    attributes={isSelected() ? TextAttributes.BOLD : TextAttributes.NONE}
                    width={6}
                  >
                    {`${isSelected() ? "▶" : " "} [${index() + 1}]`}
                  </text>

                  {/* Theme Name & Indicator */}
                  <box flexDirection="column" width={22}>
                    <text
                      fg={isSelected() ? props.palette["fg.accent"] : props.palette["fg.default"]}
                      attributes={isSelected() ? TextAttributes.BOLD : TextAttributes.NONE}
                    >
                      {`${name()} ${isCurrent() ? "*" : ""}`}
                    </text>
                    <text fg={props.palette["fg.muted"]} attributes={TextAttributes.DIM}>
                      {option.id}
                    </text>
                  </box>

                  {/* Description */}
                  <box flexGrow={1} flexDirection="row">
                    <text fg={props.palette["fg.muted"]}>{desc()}</text>
                  </box>

                  {/* Color Swatch Badges */}
                  <box flexDirection="row" gap={0} marginLeft={1}>
                    <For each={option.swatches}>{(hex) => <text fg={hex}>{"■"}</text>}</For>
                  </box>
                </box>
              );
            }}
          </For>
        </box>

        {/* Footer controls hint */}
        <box flexDirection="row" justifyContent="space-between" height={1} marginTop={1} paddingTop={0}>
          <text fg={props.palette["fg.muted"]}>{props.t("themeSelector.hint")}</text>
          <box flexDirection="row" gap={1}>
            <text fg={props.palette["fg.accent"]} onMouseDown={handleConfirm}>
              {props.t("themeSelector.confirm")}
            </text>
            <text fg={props.palette["fg.muted"]} onMouseDown={handleCancel}>
              {props.t("themeSelector.cancel")}
            </text>
          </box>
        </box>
      </box>
    </>
  );
}
