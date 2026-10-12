import { describe, expect, test } from "bun:test";

import enUS from "../design/i18n/en-US.json" with { type: "json" };
import ptBR from "../design/i18n/pt-BR.json" with { type: "json" };

function flatten(value: unknown, prefix = ""): string[] {
  if (typeof value === "string") return [prefix];
  if (typeof value !== "object" || value === null) return [];
  const keys = Object.keys(value as Record<string, unknown>);
  if (keys.length > 0 && keys.every((key) => typeof (value as Record<string, unknown>)[key] === "string")) {
    return [prefix];
  }
  return keys.flatMap((key) => flatten((value as Record<string, unknown>)[key], prefix === "" ? key : `${prefix}.${key}`));
}

describe("dicionários i18n", () => {
  test("pt-BR e en-US têm exatamente as mesmas chaves", () => {
    expect(flatten(enUS).sort()).toEqual(flatten(ptBR).sort());
  });

  test("não há chaves vazias", () => {
    for (const key of flatten(ptBR)) {
      const value = key
        .split(".")
        .reduce<unknown>((node, segment) => (node as Record<string, unknown>)?.[segment], ptBR);
      expect(String(value).length).toBeGreaterThan(0);
    }
  });
});