import { describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { loadConfig, projectConfigPath } from "../src/core/config/loader";
import { mergeConfig, parseTomlConfig } from "../src/core/config/parser";
import { defaultConfig } from "../src/core/config/schema";

async function withProjectConfig(
  content: string,
): Promise<{ directory: string; loaded: Awaited<ReturnType<typeof loadConfig>> }> {
  const directory = await mkdtemp(join(tmpdir(), "daisy-config-"));
  await mkdir(join(directory, ".daisy"), { recursive: true });
  await writeFile(join(directory, ".daisy", "config.toml"), content, "utf8");
  const loaded = await loadConfig(directory);
  return { directory, loaded };
}

describe("parseTomlConfig", () => {
  test("lê escalares e blocos", () => {
    const { config } = parseTomlConfig(
      [
        'theme = "light"',
        "showHidden = true",
        'defaultView = "grid"',
        "[colors]",
        '"fg.accent" = "#ff79c6"',
        "[bookmarks]",
        'paths = ["~/Projetos"]',
        "[preview]",
        'protocol = "sixel"',
        "maxTextBytes = 1024",
      ].join("\n"),
    );

    expect(config.theme).toBe("light");
    expect(config.showHidden).toBe(true);
    expect(config.defaultView).toBe("grid");
    expect(config.colors?.["fg.accent"]).toBe("#ff79c6");
    expect(config.bookmarks).toEqual(["~/Projetos"]);
    expect(config.preview?.protocol).toBe("sixel");
    expect(config.preview?.maxTextBytes).toBe(1024);
  });

  test("ignora valor inválido e registra aviso", () => {
    const { config, warnings } = parseTomlConfig('theme = "rosa"\niconSet = 42');
    expect(config.theme).toBeUndefined();
    expect(config.iconSet).toBeUndefined();
    expect(warnings).toHaveLength(2);
  });

  test("TOML quebrado não derruba a aplicação", () => {
    const { config, warnings } = parseTomlConfig("theme = ");
    expect(config).toEqual({});
    expect(warnings.length).toBeGreaterThan(0);
  });

  test("rejeita cor fora do formato hex", () => {
    const { config, warnings } = parseTomlConfig('[colors]\n"fg.accent" = "roxo"');
    expect(config.colors).toEqual({});
    expect(warnings).toHaveLength(1);
  });
});

describe("mergeConfig", () => {
  test("mescla camadas preservando o que não foi sobrescrito", () => {
    const base = { ...defaultConfig, bookmarks: ["~/a"], keymap: { "nav.up": ["k"] } };
    const merged = mergeConfig(base, {
      theme: "light",
      bookmarks: ["~/b"],
      keymap: { "file.trash": ["D"] },
      preview: { protocol: "blocks" },
    });

    expect(merged.theme).toBe("light");
    expect(merged.bookmarks).toEqual(["~/b"]);
    expect(merged.keymap["nav.up"]).toEqual(["k"]);
    expect(merged.keymap["file.trash"]).toEqual(["D"]);
    expect(merged.preview.protocol).toBe("blocks");
    expect(merged.preview.enabled).toBe(defaultConfig.preview.enabled);
  });
});

describe("loadConfig", () => {
  test("usa padrões quando não há arquivo", async () => {
    const directory = await mkdtemp(join(tmpdir(), "daisy-config-"));
    const loaded = await loadConfig(directory);
    expect(loaded.config.theme).toBe(defaultConfig.theme);
    expect(loaded.sources).not.toContain(projectConfigPath(directory));
    await rm(directory, { recursive: true, force: true });
  });

  test("lê config do projeto", async () => {
    const { directory, loaded } = await withProjectConfig('sortBy = "size"\n\n[keymap]\n"file.trash" = ["x"]\n');
    expect(loaded.config.sortBy).toBe("size");
    expect(loaded.config.keymap["file.trash"]).toEqual(["x"]);
    expect(loaded.sources).toContain(projectConfigPath(directory));
    await rm(directory, { recursive: true, force: true });
  });
});
