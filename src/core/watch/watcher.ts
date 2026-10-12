import chokidar, { type FSWatcher } from "chokidar";

export type DirectoryWatcher = {
  watch: (path: string) => Promise<void>;
  close: () => Promise<void>;
};

export type WatcherOptions = {
  debounceMs?: number;
};

export function createDirectoryWatcher(onChange: () => void, options: WatcherOptions = {}): DirectoryWatcher {
  const debounceMs = options.debounceMs ?? 120;
  let watcher: FSWatcher | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let current: string | undefined;

  function schedule() {
    if (timer !== undefined) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = undefined;
      onChange();
    }, debounceMs);
  }

  async function stop() {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
    if (watcher === undefined) return;
    const active = watcher;
    watcher = undefined;
    await active.close();
  }

  return {
    async watch(path) {
      if (current === path) return;
      await stop();
      current = path;

      const next = chokidar.watch(path, {
        ignoreInitial: true,
        depth: 1,
        awaitWriteFinish: { stabilityThreshold: 80, pollInterval: 20 },
      });
      watcher = next;
      next.on("add", schedule).on("addDir", schedule).on("unlink", schedule).on("unlinkDir", schedule);

      await new Promise<void>((resolve) => {
        next.on("ready", resolve);
      });
    },

    close: stop,
  };
}
