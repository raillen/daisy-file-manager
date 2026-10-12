import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { userConfigPath } from "./loader";

export function formatBookmarksToml(paths: string[]): string {
  const formatted = paths.map((p) => JSON.stringify(p)).join(", ");
  return `[bookmarks]\npaths = [${formatted}]`;
}

export function saveBookmarks(paths: string[], targetFile: string = userConfigPath()): void {
  try {
    mkdirSync(dirname(targetFile), { recursive: true });
    let content = "";
    if (existsSync(targetFile)) {
      content = readFileSync(targetFile, "utf8");
    }

    const block = formatBookmarksToml(paths);
    const bookmarksRegex = /(?:^|\n)\[bookmarks\][\s\S]*?(?=(?:\n\[[a-zA-Z0-9_.-]+\]|$))/;

    if (bookmarksRegex.test(content)) {
      content = content.replace(bookmarksRegex, `\n${block}\n`).trimStart();
    } else {
      content = content.trimEnd();
      if (content.length > 0) content += "\n\n";
      content += `${block}\n`;
    }

    writeFileSync(targetFile, content, "utf8");
  } catch {
    // Falha não fatal em sistema somente-leitura
  }
}
