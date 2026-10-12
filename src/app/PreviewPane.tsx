import { type SyntaxStyle, TextAttributes } from "@opentui/core";
import { createEffect, createSignal, Show } from "solid-js";

import type { Entry } from "../core/entries/directory";
import { formatBytes, formatDate } from "../core/format/units";
import type { Translator } from "../core/i18n/translator";
import type { PreviewCache } from "../core/preview/cache";
import type { PreviewSource } from "../core/preview/preview";
import type { Palette } from "../core/theme/palette";

export type PreviewPaneProps = {
  palette: Palette;
  syntaxStyle: SyntaxStyle;
  entry: Entry | undefined;
  cache: PreviewCache;
  t: Translator;
  locale: string;
  width: number;
};

export function PreviewPane(props: PreviewPaneProps) {
  const [source, setSource] = createSignal<PreviewSource | undefined>(undefined);
  const [loading, setLoading] = createSignal(false);

  createEffect(() => {
    const entry = props.entry;
    if (entry === undefined) {
      setSource(undefined);
      return;
    }

    let cancelled = false;
    setLoading(true);
    void props.cache.get(entry).then((next) => {
      if (cancelled) return;
      setSource(next);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  });

  return (
    <box
      flexDirection="column"
      width={props.width}
      paddingLeft={1}
      paddingRight={1}
      backgroundColor={props.palette["bg.default"]}
    >
      <box flexDirection="row" height={1}>
        <text fg={props.palette["fg.muted"]} attributes={TextAttributes.BOLD}>
          {props.t("preview.title")}
        </text>
      </box>

      <Show
        when={props.entry !== undefined}
        fallback={<text fg={props.palette["fg.muted"]}>{props.t("preview.empty")}</text>}
      >
        <Show when={!loading()} fallback={<text fg={props.palette["fg.muted"]}>{props.t("status.loading")}</text>}>
          <Show when={source()} keyed>
            {(current: PreviewSource) => (
              <>
                <Metadata entry={props.entry as Entry} palette={props.palette} t={props.t} locale={props.locale} />

                <Show when={current.kind === "image"}>
                  <image source={current.path} fit="fit" flexGrow={1} marginTop={1} />
                </Show>

                <Show when={current.kind === "text"}>
                  <box flexGrow={1} marginTop={1}>
                    <code
                      content={current.content}
                      filetype={current.filetype}
                      syntaxStyle={props.syntaxStyle}
                      flexGrow={1}
                    />
                  </box>
                </Show>

                <Show when={current.kind === "directory"}>
                  <text fg={props.palette["fg.muted"]} marginTop={1}>
                    {props.t("preview.directory.summary", {
                      count: current.childCount,
                      folders: current.folderCount,
                      files: current.childCount - current.folderCount,
                    })}
                  </text>
                </Show>

                <Show when={current.kind === "metadata"}>
                  <text fg={props.palette["fg.muted"]} marginTop={1}>
                    {props.t("preview.binary.summary")}
                  </text>
                </Show>
              </>
            )}
          </Show>
        </Show>
      </Show>
    </box>
  );
}

type MetadataProps = {
  entry: Entry;
  palette: Palette;
  t: Translator;
  locale: string;
};

function Metadata(props: MetadataProps) {
  return (
    <box flexDirection="column" marginTop={1}>
      <text fg={props.palette["fg.default"]} attributes={TextAttributes.BOLD}>
        {props.entry.name}
      </text>
      <text fg={props.palette["fg.muted"]}>{formatBytes(props.entry.size, props.t)}</text>
      <text fg={props.palette["fg.muted"]}>{formatDate(props.entry.modifiedMs, props.locale)}</text>
      <text fg={props.palette["fg.muted"]}>{props.entry.permissions}</text>
    </box>
  );
}
