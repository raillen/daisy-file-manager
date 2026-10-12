import { useRenderer, useTerminalDimensions } from "@opentui/solid";
import { createEffect, createMemo, Show } from "solid-js";
import { segmentsFor } from "../core/entries/path";
import type { SessionStore } from "../state/session";
import { visibleEntries } from "../state/session";
import type { UiStore } from "../state/ui";
import { FileGrid } from "./FileGrid";
import { FileList } from "./FileList";
import { SearchBar } from "./SearchBar";
import { type Place, Sidebar } from "./Sidebar";
import { StatusBar } from "./StatusBar";
import { TitleBar } from "./TitleBar";

export type AppProps = {
  session: SessionStore;
  ui: UiStore;
  places: Place[];
  home: string;
  separator: string;
  freeSpace: number | undefined;
};

export function App(props: AppProps) {
  const renderer = useRenderer();
  const dimensions = useTerminalDimensions();
  const palette = createMemo(() => props.ui.palette());
  const visible = createMemo(() => visibleEntries(props.session.state));
  const segments = createMemo(() => segmentsFor(props.session.state.cwd, props.home));
  const gridColumns = createMemo(() => {
    const usable = props.ui.state.sidebarVisible ? dimensions().width - 22 : dimensions().width;
    return Math.max(1, Math.floor(usable / 18));
  });
  const markedSize = createMemo(() => {
    const marked = props.session.state.marked;
    if (marked.length === 0) return undefined;
    return visible()
      .filter((entry) => marked.includes(entry.path))
      .reduce((total, entry) => total + (entry.size ?? 0), 0);
  });

  createEffect(() => {
    if (props.ui.state.quit) renderer.destroy();
  });

  const hints = createMemo(() => [
    { key: "j/k", label: props.ui.translate("navigation.back") },
    { key: "v", label: props.ui.translate("view.list") },
    { key: "?", label: props.ui.translate("help.title") },
  ]);

  return (
    <box flexDirection="column" width="100%" height="100%">
      <TitleBar
        palette={palette()}
        segments={segments()}
        separator={props.separator}
        query={props.session.state.query}
        hint={props.ui.translate("search.placeholder")}
        onNavigate={(path) => void props.session.actions.load(path)}
      />

      <box flexDirection="row" flexGrow={1}>
        <Sidebar
          palette={palette()}
          iconSet={props.ui.state.iconSet}
          t={props.ui.translate}
          places={props.places}
          activePath={props.session.state.cwd}
          onNavigate={(path) => void props.session.actions.load(path)}
        />

        <Show
          when={props.session.state.view === "grid"}
          fallback={
            <FileList
              palette={palette()}
              entries={visible()}
              cursor={props.session.state.cursor}
              marked={props.session.state.marked}
              iconSet={props.ui.state.iconSet}
              locale={props.ui.state.locale}
              t={props.ui.translate}
            />
          }
        >
          <FileGrid
            palette={palette()}
            entries={visible()}
            cursor={props.session.state.cursor}
            marked={props.session.state.marked}
            iconSet={props.ui.state.iconSet}
            columns={gridColumns()}
          />
        </Show>
      </box>

      <Show when={props.ui.state.mode === "search"}>
        <SearchBar
          palette={palette()}
          label={props.ui.translate("modes.search")}
          placeholder={props.ui.translate("search.placeholder")}
          onQuery={(value) => props.session.actions.setQuery(value)}
          onSubmit={() => props.ui.actions.closeSearch()}
        />
      </Show>

      <StatusBar
        palette={palette()}
        total={props.session.state.entries.length}
        visible={visible().length}
        marked={props.session.state.marked.length}
        selectedSize={markedSize()}
        freeSpace={props.freeSpace}
        loading={props.session.state.loading}
        message={props.session.state.error}
        t={props.ui.translate}
        hints={hints()}
      />
    </box>
  );
}
