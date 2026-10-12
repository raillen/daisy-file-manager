import { describe, expect, test } from "bun:test";

import { palettes } from "../src/core/theme/palette";

describe("paleta canônica", () => {
  test("todas as paletas têm os mesmos tokens", () => {
    expect(Object.keys(palettes.light).sort()).toEqual(Object.keys(palettes.dark).sort());
  });

  test("todo valor é hex com canal alfa opcional", () => {
    for (const palette of Object.values(palettes)) {
      for (const value of Object.values(palette)) {
        expect(value).toMatch(/^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/);
      }
    }
  });
});