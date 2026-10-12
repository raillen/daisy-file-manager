import { describe, expect, test } from "bun:test";

import { kindFromName } from "../src/core/entries/kind";
import { createTranslator } from "../src/core/i18n/translator";
import { glyph, iconColor } from "../src/core/theme/icons";
import { iconForKind } from "../src/core/theme/kindIcons";
import { formatBytes, formatDate } from "../src/core/format/units";

describe("kindFromName", () => {
  test("classifica por extensão", () => {
    expect(kindFromName("main.ts")).toBe("code");
    expect(kindFromName("photo.PNG")).toBe("image");
    expect(kindFromName("notes.md")).toBe("markdown");
    expect(kindFromName("bundle.tar.gz")).toBe("archive");
  });

  test("nome exato vence extensão", () => {
    expect(kindFromName("package.json")).toBe("package");
    expect(kindFromName("Dockerfile")).toBe("config");
  });

  test("sem extensão cai em genérico", () => {
    expect(kindFromName("LICENSE")).toBe("generic");
    expect(kindFromName("sem-extensao")).toBe("generic");
  });
});

describe("i18n translator", () => {
  test("interpola parâmetros", () => {
    const t = createTranslator("pt-BR");
    expect(t("preview.directory.summary", { count: 3, folders: 1, files: 2 })).toBe(
      "3 itens · 1 pastas · 2 arquivos",
    );
  });

  test("escolhe plural correto", () => {
    const t = createTranslator("en-US");
    expect(t("list.itemCount", { count: 1 })).toBe("1 item");
    expect(t("list.itemCount", { count: 7 })).toBe("7 items");
  });

  test("chave inexistente retorna a própria chave", () => {
    const t = createTranslator("pt-BR");
    expect(t("nao.existe")).toBe("nao.existe");
  });
});

describe("ícones", () => {
  test("fallback unicode funciona sem Nerd Font", () => {
    expect(glyph("ui.home", "unicode")).toBe("⌂");
    expect(glyph("file.directory", "nerd")).toBe("");
  });

  test("mapeia tipo para ícone semântico", () => {
    expect(iconForKind("code")).toBe("file.code");
    expect(iconColor("file.directory")).toBe("fg.directory");
  });
});

describe("formatadores", () => {
  const t = createTranslator("pt-BR");

  test("formatBytes", () => {
    expect(formatBytes(512, t)).toBe("512 B");
    expect(formatBytes(2048, t)).toBe("2.0 KB");
    expect(formatBytes(5 * 1024 ** 3, t)).toBe("5.0 GB");
    expect(formatBytes(undefined, t)).toBe("?");
  });

  test("formatDate com locale", () => {
    expect(formatDate(0, "pt-BR")).toContain("/");
  });
});