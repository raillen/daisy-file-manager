import { expect, test } from "bun:test";

import { KeyEvent } from "@opentui/core";
import { createDefaultOpenTuiKeymap } from "@opentui/keymap/opentui";
import { KeymapProvider } from "@opentui/keymap/solid";
import { testRender, useRenderer } from "@opentui/solid";

import { App } from "../src/app/App";
import { useCommandLayer } from "../src/commands/useCommandLayer";
import type { Entry } from "../src/core/entries/directory";
import { createTranslator } from "../src/core/i18n/translator";
import { createPreviewCache } from "../src/core/preview/cache";
import type { DriveDevice } from "../src/core/system/drives";
import { defaultTheme, palettes } from "../src/core/theme/palette";
import { createClipboardStore, createQueueStore } from "../src/state/operations";
import { createSessionStore, type SessionState, visibleEntries } from "../src/state/session";
import { createUiStore, type UiState } from "../src/state/ui";

function emptySession(cwd: string): SessionState {
  return {
    cwd,
    entries: [],
    cursor: 0,
    marked: [],
    query: "",
    showHidden: false,
    view: "list",
    sort: { field: "name", descending: false, directoriesFirst: true },
    loading: false,
    error: undefined,
  };
}

function testStores(cwd: string) {
  const session = createSessionStore(emptySession(cwd));
  const ui = createUiStore({
    initial: {
      mode: "normal",
      properties: undefined,
      inputDialog: undefined,
      contextMenu: undefined,
      viewerModal: undefined,
      targetFolderDialog: undefined,
      helpOpen: false,
      theme: defaultTheme,
      locale: "pt-BR",
      iconSet: "unicode",
      sidebarVisible: true,
      sidebarWidth: 22,
      previewVisible: true,
      previewWidth: 40,
      splitPane: false,
      activePane: "left",
      splitRatio: 0.5,
      bookmarks: [],
      quit: false,
    } as UiState,
    translators: { "pt-BR": createTranslator("pt-BR"), "en-US": createTranslator("en-US") },
    palettes,
  });
  return { session, ui };
}

test("App renders headlessly", async () => {
  const cwd = process.cwd();
  const { session, ui } = testStores(cwd);
  await session.actions.load(cwd);

  const previewCache = createPreviewCache({ maxTextBytes: 1024 });
  const clipboard = createClipboardStore();
  const queue = createQueueStore();

  const setup = await testRender(() => (
    <App
      keymapOverrides={{}}
      previewCache={previewCache}
      clipboard={clipboard}
      queue={queue}
      session={session}
      ui={ui}
      places={[]}
      home={cwd}
      separator="/"
      freeSpace={undefined}
    />
  ));
  await setup.renderOnce();

  const frame = setup.captureCharFrame();
  expect(frame).toContain("daisy");
  expect(setup.renderer).toBeTruthy();

  await setup.dispose();
});

test("App with KeymapProvider and useCommandLayer mounts cleanly", async () => {
  const cwd = process.cwd();
  const { session, ui } = testStores(cwd);
  await session.actions.load(cwd);

  const previewCache = createPreviewCache({ maxTextBytes: 1024 });
  const clipboard = createClipboardStore();
  const queue = createQueueStore();

  function RootWrapper() {
    const renderer = useRenderer();
    const keymap = createDefaultOpenTuiKeymap(renderer);

    function Inner() {
      useCommandLayer({
        session,
        ui,
        clipboard,
        queue,
        currentEntryPath: () => undefined,
        onQuit: () => {},
      });
      return (
        <App
          keymapOverrides={{}}
          previewCache={previewCache}
          clipboard={clipboard}
          queue={queue}
          session={session}
          ui={ui}
          places={[]}
          home={cwd}
          separator="/"
          freeSpace={undefined}
        />
      );
    }

    return (
      <KeymapProvider keymap={keymap}>
        <Inner />
      </KeymapProvider>
    );
  }

  const setup = await testRender(() => <RootWrapper />);
  await setup.renderOnce();
  const frame = setup.captureCharFrame();
  expect(frame).toContain("daisy");
  await setup.dispose();
});

test("App renders ImageViewerDialog when viewerModal is an image", async () => {
  const cwd = process.cwd();
  const { session, ui } = testStores(cwd);
  await session.actions.load(cwd);

  const previewCache = createPreviewCache({ maxTextBytes: 1024 });
  const clipboard = createClipboardStore();
  const queue = createQueueStore();

  const entry: Entry = {
    name: "photo.png",
    path: `${cwd}/photo.png`,
    kind: "image",
    isDirectory: false,
    isSymlink: false,
    size: 2048,
    modifiedMs: Date.now(),
    permissions: "-rw-r--r--",
  };

  ui.actions.openImageViewer(entry);

  const setup = await testRender(() => (
    <App
      keymapOverrides={{}}
      previewCache={previewCache}
      clipboard={clipboard}
      queue={queue}
      session={session}
      ui={ui}
      places={[]}
      home={cwd}
      separator="/"
      freeSpace={undefined}
    />
  ));
  await setup.renderOnce();
  const frame = setup.captureCharFrame();
  expect(frame).toContain("photo.png");
  await setup.dispose();
});

test("App renders TextViewerDialog when viewerModal is text", async () => {
  const cwd = process.cwd();
  const { session, ui } = testStores(cwd);
  await session.actions.load(cwd);

  const previewCache = createPreviewCache({ maxTextBytes: 1024 });
  const clipboard = createClipboardStore();
  const queue = createQueueStore();

  const entry: Entry = {
    name: "README.md",
    path: `${cwd}/README.md`,
    kind: "markdown",
    isDirectory: false,
    isSymlink: false,
    size: 512,
    modifiedMs: Date.now(),
    permissions: "-rw-r--r--",
  };

  ui.actions.openTextViewer(entry, "# Hello World\nDaisy is awesome", "markdown");

  const setup = await testRender(() => (
    <App
      keymapOverrides={{}}
      previewCache={previewCache}
      clipboard={clipboard}
      queue={queue}
      session={session}
      ui={ui}
      places={[]}
      home={cwd}
      separator="/"
      freeSpace={undefined}
    />
  ));
  await setup.renderOnce();
  const frame = setup.captureCharFrame();
  expect(frame).toContain("README.md");
  expect(frame).toContain("markdown");
  await setup.dispose();
});

test("App renders TargetFolderDialog when targetFolderDialog is set", async () => {
  const cwd = process.cwd();
  const { session, ui } = testStores(cwd);
  await session.actions.load(cwd);

  const previewCache = createPreviewCache({ maxTextBytes: 1024 });
  const clipboard = createClipboardStore();
  const queue = createQueueStore();

  ui.actions.openTargetFolderDialog("copy", [`${cwd}/test.txt`]);

  const setup = await testRender(() => (
    <App
      keymapOverrides={{}}
      previewCache={previewCache}
      clipboard={clipboard}
      queue={queue}
      session={session}
      ui={ui}
      places={[]}
      home={cwd}
      separator="/"
      freeSpace={undefined}
    />
  ));
  await setup.renderOnce();
  const frame = setup.captureCharFrame();
  expect(frame).toContain("Copiar 1 itens");
  expect(frame).toContain("[Espaço] Confirmar");
  await setup.dispose();
});

test("App renders ToastNotification when queue is running with progress", async () => {
  const cwd = process.cwd();
  const { session, ui } = testStores(cwd);
  await session.actions.load(cwd);

  const previewCache = createPreviewCache({ maxTextBytes: 1024 });
  const clipboard = createClipboardStore();
  const queue = createQueueStore();

  queue.actions.report({
    kind: "copy",
    current: 5,
    total: 10,
    path: `${cwd}/sample.txt`,
  });

  const setup = await testRender(() => (
    <App
      keymapOverrides={{}}
      previewCache={previewCache}
      clipboard={clipboard}
      queue={queue}
      session={session}
      ui={ui}
      places={[]}
      home={cwd}
      separator="/"
      freeSpace={undefined}
    />
  ));
  await setup.renderOnce();
  const frame = setup.captureCharFrame();
  expect(frame).toContain("50%");
  expect(frame).toContain("sample.txt");
  await setup.dispose();
});

test("F5 or Shift+C triggers file.copyTo and opens TargetFolderDialog", async () => {
  const cwd = process.cwd();
  const { session, ui } = testStores(cwd);
  await session.actions.load(cwd);

  const previewCache = createPreviewCache({ maxTextBytes: 1024 });
  const clipboard = createClipboardStore();
  const queue = createQueueStore();

  function RootWrapper() {
    const renderer = useRenderer();
    const keymap = createDefaultOpenTuiKeymap(renderer);

    function Inner() {
      useCommandLayer({
        session,
        ui,
        clipboard,
        queue,
        currentEntryPath: () => undefined,
        onQuit: () => {},
      });
      return (
        <App
          keymapOverrides={{}}
          previewCache={previewCache}
          clipboard={clipboard}
          queue={queue}
          session={session}
          ui={ui}
          places={[]}
          home={cwd}
          separator="/"
          freeSpace={undefined}
        />
      );
    }

    return (
      <KeymapProvider keymap={keymap}>
        <Inner />
      </KeymapProvider>
    );
  }

  const setup = await testRender(() => <RootWrapper />);
  await setup.renderOnce();

  expect(ui.state.targetFolderDialog).toBeUndefined();

  setup.renderer.keyInput.emit(
    "keypress",
    new KeyEvent({
      name: "f5",
      ctrl: false,
      meta: false,
      shift: false,
      option: false,
      number: false,
      sequence: "\x1b[15~",
      raw: "\x1b[15~",
      eventType: "press",
      source: "raw",
    }),
  );

  expect(ui.state.targetFolderDialog?.mode).toBe("copy");

  ui.actions.closeTargetFolderDialog();
  expect(ui.state.targetFolderDialog).toBeUndefined();

  setup.renderer.keyInput.emit(
    "keypress",
    new KeyEvent({
      name: "c",
      ctrl: false,
      meta: false,
      shift: true,
      option: false,
      number: false,
      sequence: "C",
      raw: "C",
      eventType: "press",
      source: "raw",
    }),
  );

  expect(ui.state.targetFolderDialog?.mode).toBe("copy");

  await setup.dispose();
});

test("App renders PdfViewerDialog when viewerModal is pdf", async () => {
  const cwd = process.cwd();
  const { session, ui } = testStores(cwd);
  await session.actions.load(cwd);

  const previewCache = createPreviewCache({ maxTextBytes: 1024 });
  const clipboard = createClipboardStore();
  const queue = createQueueStore();

  const entry: Entry = {
    name: "manual.pdf",
    path: `${cwd}/manual.pdf`,
    kind: "pdf",
    isDirectory: false,
    isSymlink: false,
    size: 2048,
    modifiedMs: Date.now(),
    permissions: "-rw-r--r--",
  };

  ui.actions.openPdfViewer(entry, 10);

  function RootWrapper() {
    const renderer = useRenderer();
    const keymap = createDefaultOpenTuiKeymap(renderer);

    return (
      <KeymapProvider keymap={keymap}>
        <App
          keymapOverrides={{}}
          previewCache={previewCache}
          clipboard={clipboard}
          queue={queue}
          session={session}
          ui={ui}
          places={[]}
          home={cwd}
          separator="/"
          freeSpace={undefined}
        />
      </KeymapProvider>
    );
  }

  const setup = await testRender(() => <RootWrapper />);
  await setup.renderOnce();
  const frame = setup.captureCharFrame();
  expect(frame).toContain("manual");
  expect(frame).toContain("Página 1");
  expect(frame).toContain("Modo Texto");
  expect(frame).toContain("100%");

  // Test zoom in with '+'
  setup.renderer.keyInput.emit(
    "keypress",
    new KeyEvent({
      name: "+",
      ctrl: false,
      meta: false,
      shift: false,
      option: false,
      number: false,
      sequence: "+",
      raw: "+",
      eventType: "press",
      source: "raw",
    }),
  );
  await setup.renderOnce();
  const zoomedFrame = setup.captureCharFrame();
  expect(zoomedFrame).toContain("125%");

  // Test fit toggle with 'f'
  setup.renderer.keyInput.emit(
    "keypress",
    new KeyEvent({
      name: "f",
      ctrl: false,
      meta: false,
      shift: false,
      option: false,
      number: false,
      sequence: "f",
      raw: "f",
      eventType: "press",
      source: "raw",
    }),
  );
  await setup.renderOnce();
  const fitFrame = setup.captureCharFrame();
  expect(fitFrame).toContain("Ajustado");

  await setup.dispose();
});

test("App renders dual-pane split and switches active pane with Tab", async () => {
  const cwd = process.cwd();
  const { session, ui } = testStores(cwd);
  const secondarySession = createSessionStore(emptySession("/tmp"));
  await session.actions.load(cwd);
  await secondarySession.actions.load("/tmp");

  ui.actions.toggleSplitPane();
  expect(ui.state.splitPane).toBe(true);
  expect(ui.state.activePane).toBe("left");

  const previewCache = createPreviewCache({ maxTextBytes: 1024 });
  const clipboard = createClipboardStore();
  const queue = createQueueStore();

  const activeSession = () => (ui.state.splitPane && ui.state.activePane === "right" ? secondarySession : session);

  function RootWrapper() {
    const renderer = useRenderer();
    const keymap = createDefaultOpenTuiKeymap(renderer);

    function Inner() {
      useCommandLayer({
        session,
        activeSession,
        onSwitchPane: () => ui.actions.switchPane(),
        ui,
        clipboard,
        queue,
        currentEntryPath: () => undefined,
        onQuit: () => {},
      });
      return (
        <App
          keymapOverrides={{}}
          previewCache={previewCache}
          clipboard={clipboard}
          queue={queue}
          session={session}
          secondarySession={secondarySession}
          ui={ui}
          places={[]}
          home={cwd}
          separator="/"
          freeSpace={undefined}
        />
      );
    }

    return (
      <KeymapProvider keymap={keymap}>
        <Inner />
      </KeymapProvider>
    );
  }

  const setup = await testRender(() => <RootWrapper />, { width: 140, height: 35 });
  await setup.renderOnce();
  const frame = setup.captureCharFrame();
  expect(frame).toContain(ui.translate("view.activePane"));
  expect(frame).toContain(ui.translate("view.rightPane"));

  // Press 'tab' to switch active pane to right
  setup.renderer.keyInput.emit(
    "keypress",
    new KeyEvent({
      name: "tab",
      ctrl: false,
      meta: false,
      shift: false,
      option: false,
      number: false,
      sequence: "\t",
      raw: "\t",
      eventType: "press",
      source: "raw",
    }),
  );
  await setup.renderOnce();
  expect(ui.state.activePane).toBe("right");
  const rightActiveFrame = setup.captureCharFrame();
  expect(rightActiveFrame).toContain(ui.translate("view.leftPane"));

  // Press 'tab' again to switch active pane back to left
  setup.renderer.keyInput.emit(
    "keypress",
    new KeyEvent({
      name: "tab",
      ctrl: false,
      meta: false,
      shift: false,
      option: false,
      number: false,
      sequence: "\t",
      raw: "\t",
      eventType: "press",
      source: "raw",
    }),
  );
  await setup.renderOnce();
  expect(ui.state.activePane).toBe("left");

  await setup.dispose();
});

test("HelpOverlay renders shortcuts cleanly without character collisions", async () => {
  const cwd = process.cwd();
  const { session, ui } = testStores(cwd);
  ui.actions.toggleHelp();
  expect(ui.state.helpOpen).toBe(true);

  const previewCache = createPreviewCache({ maxTextBytes: 1024 });
  const clipboard = createClipboardStore();
  const queue = createQueueStore();

  const setup = await testRender(
    () => (
      <App
        keymapOverrides={{}}
        previewCache={previewCache}
        clipboard={clipboard}
        queue={queue}
        session={session}
        ui={ui}
        places={[]}
        home={cwd}
        separator="/"
        freeSpace={undefined}
      />
    ),
    { width: 120, height: 40 },
  );
  await setup.renderOnce();
  const frame = setup.captureCharFrame();
  expect(frame).toContain("Ajuda");
  expect(frame).toContain("nav.down");
  expect(frame).toContain("nav.up");
  expect(frame).not.toContain("nav.upwn");
  expect(frame).not.toContain("file.mkdirrties");
  expect(frame).not.toContain("view.toggleodified");

  await setup.dispose();
});

test("Pressing 'b' pins current folder to bookmarks in sidebar and toggles unpin", async () => {
  const cwd = process.cwd();
  const { session, ui } = testStores(cwd);
  await session.actions.load(cwd);

  const previewCache = createPreviewCache({ maxTextBytes: 1024 });
  const clipboard = createClipboardStore();
  const queue = createQueueStore();

  function RootWrapper() {
    const renderer = useRenderer();
    const keymap = createDefaultOpenTuiKeymap(renderer);

    function Inner() {
      useCommandLayer({
        session,
        ui,
        clipboard,
        queue,
        currentEntryPath: () => undefined,
        onQuit: () => {},
      });
      return (
        <App
          keymapOverrides={{}}
          previewCache={previewCache}
          clipboard={clipboard}
          queue={queue}
          session={session}
          ui={ui}
          places={[]}
          home={cwd}
          separator="/"
          freeSpace={undefined}
        />
      );
    }

    return (
      <KeymapProvider keymap={keymap}>
        <Inner />
      </KeymapProvider>
    );
  }

  const setup = await testRender(() => <RootWrapper />, { width: 120, height: 35 });
  await setup.renderOnce();

  // Initially bookmarks are empty
  expect(ui.state.bookmarks).toEqual([]);

  // Press 'b' to bookmark current directory
  setup.renderer.keyInput.emit(
    "keypress",
    new KeyEvent({
      name: "b",
      ctrl: false,
      meta: false,
      shift: false,
      option: false,
      number: false,
      sequence: "b",
      raw: "b",
      eventType: "press",
      source: "raw",
    }),
  );
  await setup.renderOnce();

  expect(ui.state.bookmarks).toContain(cwd);
  const frame = setup.captureCharFrame();
  expect(frame).toContain("Marcadores");

  // Press 'b' again to unpin
  setup.renderer.keyInput.emit(
    "keypress",
    new KeyEvent({
      name: "b",
      ctrl: false,
      meta: false,
      shift: false,
      option: false,
      number: false,
      sequence: "b",
      raw: "b",
      eventType: "press",
      source: "raw",
    }),
  );
  await setup.renderOnce();

  expect(ui.state.bookmarks).not.toContain(cwd);

  await setup.dispose();
});

test("Pressing 'm' opens ContextMenu and Escape closes it", async () => {
  const cwd = process.cwd();
  const { session, ui } = testStores(cwd);
  await session.actions.load(cwd);

  const previewCache = createPreviewCache({ maxTextBytes: 1024 });
  const clipboard = createClipboardStore();
  const queue = createQueueStore();

  function RootWrapper() {
    const renderer = useRenderer();
    const keymap = createDefaultOpenTuiKeymap(renderer);

    function Inner() {
      useCommandLayer({
        session,
        ui,
        clipboard,
        queue,
        currentEntryPath: () => visibleEntries(session.state)[session.state.cursor]?.path,
        onQuit: () => {},
      });
      return (
        <App
          keymapOverrides={{}}
          previewCache={previewCache}
          clipboard={clipboard}
          queue={queue}
          session={session}
          ui={ui}
          places={[]}
          home={cwd}
          separator="/"
          freeSpace={undefined}
        />
      );
    }

    return (
      <KeymapProvider keymap={keymap}>
        <Inner />
      </KeymapProvider>
    );
  }

  const setup = await testRender(() => <RootWrapper />, { width: 120, height: 35 });
  await setup.renderOnce();

  expect(ui.state.contextMenu).toBeUndefined();

  // Press 'm' to open context menu
  setup.renderer.keyInput.emit(
    "keypress",
    new KeyEvent({
      name: "m",
      ctrl: false,
      meta: false,
      shift: false,
      option: false,
      number: false,
      sequence: "m",
      raw: "m",
      eventType: "press",
      source: "raw",
    }),
  );
  await setup.renderOnce();

  expect(ui.state.contextMenu).toBeDefined();

  const frame = setup.captureCharFrame();
  expect(frame).toContain("Abrir");
  expect(frame).toContain("Renomear");
  expect(frame).toContain("Copiar");

  // Press 'escape' to close
  setup.renderer.keyInput.emit(
    "keypress",
    new KeyEvent({
      name: "escape",
      ctrl: false,
      meta: false,
      shift: false,
      option: false,
      number: false,
      sequence: "\x1b",
      raw: "\x1b",
      eventType: "press",
      source: "raw",
    }),
  );
  await setup.renderOnce();

  expect(ui.state.contextMenu).toBeUndefined();

  await setup.dispose();
});

test("App renders external and mounted drives in sidebar", async () => {
  const cwd = process.cwd();
  const { session, ui } = testStores(cwd);
  await session.actions.load(cwd);

  const previewCache = createPreviewCache({ maxTextBytes: 1024 });
  const clipboard = createClipboardStore();
  const queue = createQueueStore();

  const fakeDrives: DriveDevice[] = [
    {
      name: "sdb1",
      path: "/dev/sdb1",
      mountpoint: "/run/media/user/PendriveUSB",
      label: "PendriveUSB",
      size: "64G",
      isRemovable: true,
      fstype: "vfat",
    },
    {
      name: "sda3",
      path: "/dev/sda3",
      mountpoint: "/home/raillen/Dados",
      label: "Dados",
      size: "1TB",
      isRemovable: false,
      fstype: "ext4",
    },
  ];

  const setup = await testRender(
    () => (
      <App
        keymapOverrides={{}}
        previewCache={previewCache}
        clipboard={clipboard}
        queue={queue}
        session={session}
        ui={ui}
        places={[]}
        drives={fakeDrives}
        home={cwd}
        separator="/"
        freeSpace={undefined}
        onUnmountDrive={() => {}}
      />
    ),
    { width: 120, height: 35 },
  );
  await setup.renderOnce();

  const frame = setup.captureCharFrame();
  expect(frame).toContain("Volumes");
  expect(frame).toContain("PendriveUSB");
  expect(frame).toContain("Dados");
  expect(frame).toContain("⏏");

  await setup.dispose();
});
