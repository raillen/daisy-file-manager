import type { Entry } from "./directory";

export type SortField = "name" | "size" | "modified" | "kind";

export type SortOptions = {
  field: SortField;
  descending: boolean;
  directoriesFirst: boolean;
};

export const defaultSortOptions: SortOptions = {
  field: "name",
  descending: false,
  directoriesFirst: true,
};

const collator = new Intl.Collator("pt-BR", { numeric: true, sensitivity: "base" });

function compareBy(field: SortField, left: Entry, right: Entry): number {
  switch (field) {
    case "name":
      return collator.compare(left.name, right.name);
    case "size":
      return (left.size ?? -1) - (right.size ?? -1);
    case "modified":
      return (left.modifiedMs ?? 0) - (right.modifiedMs ?? 0);
    case "kind":
      return collator.compare(left.kind, right.kind) || collator.compare(left.name, right.name);
  }
}

export function sortEntries(entries: Entry[], options: SortOptions): Entry[] {
  const direction = options.descending ? -1 : 1;

  return [...entries].sort((left, right) => {
    if (options.directoriesFirst && left.isDirectory !== right.isDirectory) {
      return left.isDirectory ? -1 : 1;
    }
    return compareBy(options.field, left, right) * direction;
  });
}

export function filterEntries(entries: Entry[], query: string, showHidden: boolean): Entry[] {
  const filtered = showHidden ? [...entries] : entries.filter((entry) => !entry.name.startsWith("."));

  const needle = query.trim().toLocaleLowerCase("pt-BR");
  if (needle === "") return filtered;

  return filtered.filter((entry) => fuzzyMatch(entry.name.toLocaleLowerCase("pt-BR"), needle));
}

export function fuzzyMatch(haystack: string, needle: string): boolean {
  let index = 0;
  for (const character of needle) {
    const found = haystack.indexOf(character, index);
    if (found === -1) return false;
    index = found + 1;
  }
  return true;
}
