import { afterEach, beforeEach, expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { createDirectoryWatcher } from "../src/core/watch/watcher";

let root = "";

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "daisy-watch-"));
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

function waitFor(condition: () => boolean, timeoutMs = 3000): Promise<void> {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const tick = () => {
      if (condition()) {
        resolve();
        return;
      }
      if (Date.now() - started > timeoutMs) {
        reject(new Error("timeout aguardando evento do watcher"));
        return;
      }
      setTimeout(tick, 40);
    };
    tick();
  });
}

test("watcher notifica criação de arquivo", async () => {
  let changes = 0;
  const watcher = createDirectoryWatcher(
    () => {
      changes += 1;
    },
    { debounceMs: 30 },
  );

  try {
    await watcher.watch(root);
    await writeFile(join(root, "novo.txt"), "x", "utf8");
    await waitFor(() => changes > 0);
    expect(changes).toBeGreaterThan(0);
  } finally {
    await watcher.close();
  }
});

test("watcher acompanha troca de diretório", async () => {
  const other = join(root, "outro");
  await mkdir(other, { recursive: true });

  const seen: string[] = [];
  const watcher = createDirectoryWatcher(
    () => {
      seen.push("change");
    },
    { debounceMs: 30 },
  );

  try {
    await watcher.watch(root);
    await watcher.watch(other);
    await writeFile(join(other, "segundo.txt"), "x", "utf8");
    await waitFor(() => seen.length > 0);
    expect(seen.length).toBeGreaterThan(0);
  } finally {
    await watcher.close();
  }
});

test("watcher para de notificar após close", async () => {
  let changes = 0;
  const watcher = createDirectoryWatcher(
    () => {
      changes += 1;
    },
    { debounceMs: 20 },
  );

  await watcher.watch(root);
  await watcher.close();
  await writeFile(join(root, "depois.txt"), "x", "utf8");
  await new Promise((resolve) => setTimeout(resolve, 200));

  expect(changes).toBe(0);
});
