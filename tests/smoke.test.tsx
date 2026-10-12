import { expect, test } from "bun:test";

import { testRender } from "@opentui/solid";

import { App } from "../src/app/App";

test("App renders headlessly", async () => {
  const setup = await testRender(() => <App />);
  await setup.renderOnce();
  expect(setup.renderer).toBeTruthy();
  await setup.dispose();
});
