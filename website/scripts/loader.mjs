const cache = new Map();

export async function loadText(path) {
  if (cache.has(path)) return cache.get(path);

  const response = await fetch(`./docs/${path}`, { cache: "no-cache" });
  if (!response.ok) {
    throw new Error(`Falha ao carregar ${path} (${response.status})`);
  }

  const text = await response.text();
  cache.set(path, text);
  return text;
}

export function cachedText(path) {
  return cache.get(path) ?? "";
}

export function preload(paths) {
  return Promise.all(paths.map(loadText));
}