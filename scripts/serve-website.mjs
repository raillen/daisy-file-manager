#!/usr/bin/env bun
import { existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
const PORT = Number(process.env.PORT ?? 4321);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
};

async function fileAt(candidate) {
  if (!candidate.startsWith(ROOT) || !existsSync(candidate)) return null;
  const info = await stat(candidate);
  if (info.isFile()) return candidate;
  const index = join(candidate, "index.html");
  return existsSync(index) ? index : null;
}

async function resolveRequestPath(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0]);
  const relative = normalize(clean === "/" ? "/website/index.html" : clean);

  const direct = await fileAt(join(ROOT, relative));
  if (direct !== null) return direct;

  return fileAt(join(ROOT, relative, "index.html"));
}

const server = Bun.serve({
  port: PORT,
  async fetch(request) {
    const url = new URL(request.url);
    const path = await resolveRequestPath(url.pathname);

    if (path === null) {
      return new Response("Not found", { status: 404 });
    }

    return new Response(Bun.file(path), {
      headers: {
        "content-type": MIME[extname(path)] ?? "application/octet-stream",
        "cache-control": "no-cache",
      },
    });
  },
});

console.log(`site do daisy em http://localhost:${server.port}/website/`);
