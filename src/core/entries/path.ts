import { dirname, join, parse, resolve } from "node:path";

export type BreadcrumbSegment = {
  name: string;
  path: string;
};

export function segmentsFor(path: string, home: string): BreadcrumbSegment[] {
  const target = resolve(path);
  const resolvedHome = resolve(home);
  const rootPath = parse(target).root;

  if (target === resolvedHome) {
    return [{ name: "~", path: resolvedHome }];
  }

  if (target.startsWith(`${resolvedHome}/`)) {
    const segments: BreadcrumbSegment[] = [{ name: "~", path: resolvedHome }];
    let accumulated = resolvedHome;
    for (const part of target.slice(resolvedHome.length + 1).split("/")) {
      accumulated = `${accumulated}/${part}`;
      segments.push({ name: part, path: accumulated });
    }
    return segments;
  }

  const segments: BreadcrumbSegment[] = [{ name: rootPath, path: rootPath }];
  let accumulated = rootPath;
  for (const part of target.slice(rootPath.length).split("/")) {
    if (part === "") continue;
    accumulated = `${accumulated}/${part}`;
    segments.push({ name: part, path: accumulated });
  }
  return segments;
}

export function parentOf(path: string): string | null {
  const parent = dirname(resolve(path));
  return parent === resolve(path) ? null : parent;
}

export function isInside(path: string, root: string): boolean {
  const resolvedPath = resolve(path);
  const resolvedRoot = resolve(root);
  return resolvedPath === resolvedRoot || resolvedPath.startsWith(`${resolvedRoot}/`);
}

export function shortPath(path: string, home: string): string {
  const resolved = resolve(path);
  const resolvedHome = resolve(home);
  if (resolved === resolvedHome) return "~";
  if (resolved.startsWith(`${resolvedHome}/`)) return join("~", resolved.slice(resolvedHome.length + 1));
  return resolved;
}
