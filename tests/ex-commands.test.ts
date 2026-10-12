import { describe, expect, test } from "bun:test";

import { parseExCommand } from "../src/core/commands/exCommand";

describe("parseExCommand", () => {
  test("reconhece :q e :quit", () => {
    expect(parseExCommand(":q").kind).toBe("quit");
    expect(parseExCommand(":quit").kind).toBe("quit");
    expect(parseExCommand("q").kind).toBe("quit");
  });

  test("extrai argumentos para :cd", () => {
    const parsed = parseExCommand(":cd /tmp/folder");
    expect(parsed.kind).toBe("cd");
    expect(parsed.args).toEqual(["/tmp/folder"]);
  });

  test("extrai argumentos para :mkdir e :touch", () => {
    const mkdir = parseExCommand(":mkdir nova-pasta");
    expect(mkdir.kind).toBe("mkdir");
    expect(mkdir.args).toEqual(["nova-pasta"]);

    const touch = parseExCommand(":touch arquivo.txt");
    expect(touch.kind).toBe("touch");
    expect(touch.args).toEqual(["arquivo.txt"]);
  });

  test("reconhece :theme e :sort", () => {
    const theme = parseExCommand(":theme dark");
    expect(theme.kind).toBe("theme");
    expect(theme.args).toEqual(["dark"]);

    const sort = parseExCommand(":sort size");
    expect(sort.kind).toBe("sort");
    expect(sort.args).toEqual(["size"]);

    const extract = parseExCommand(":extract bundle.zip");
    expect(extract.kind).toBe("extract");
    expect(extract.args).toEqual(["bundle.zip"]);
  });

  test("trata entrada vazia e comando desconhecido", () => {
    expect(parseExCommand("").kind).toBe("unknown");
    expect(parseExCommand(":").kind).toBe("unknown");
    expect(parseExCommand(":xyz param").kind).toBe("unknown");
    expect(parseExCommand(":xyz param").name).toBe("xyz");
  });
});
