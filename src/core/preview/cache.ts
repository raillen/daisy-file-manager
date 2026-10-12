import type { Entry } from "../entries/directory";

import { type PreviewLimits, type PreviewSource, previewFor } from "./preview";

export type PreviewCache = {
  get: (entry: Entry) => Promise<PreviewSource>;
  clear: () => void;
};

type CacheItem = {
  source: PreviewSource;
  key: string;
};

export function cacheKeyFor(entry: Entry): string {
  return `${entry.path}:${entry.size ?? 0}:${entry.modifiedMs ?? 0}`;
}

export function createPreviewCache(limits: PreviewLimits, capacity = 32): PreviewCache {
  const items = new Map<string, CacheItem>();

  function store(key: string, source: PreviewSource) {
    if (items.size >= capacity) {
      const oldest = items.keys().next();
      if (oldest.done !== true) items.delete(oldest.value);
    }
    items.set(key, { source, key });
  }

  return {
    async get(entry) {
      const key = cacheKeyFor(entry);
      const hit = items.get(key);
      if (hit !== undefined) return hit.source;

      const source = await previewFor(entry, limits);
      store(key, source);
      return source;
    },

    clear() {
      items.clear();
    },
  };
}
