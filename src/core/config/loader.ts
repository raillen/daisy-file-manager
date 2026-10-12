import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join, resolve } from "node:path";

import { mergeConfig, parseTomlConfig } from "./parser";
import { configFileName, defaultConfig, type Config, type ConfigOverride } from "./schema";

export type LoadedConfig = {
  config: Config;
  sources: string[];
  warnings: string[];
};

export function userConfigPath(env: NodeJS.ProcessEnv = process.env): string {
  const base = env.XDG_CONFIG_HOME ?? join(homedir(), ".config");
  return join(base, "daisy", configFileName);
}

export function projectConfigPath(cwd: string): string {
  return join(resolve(cwd), ".daisy", configFileName);
}

async function readLayer(path: string, warnings: string[]): Promise<ConfigOverride | undefined> {
  if (!existsSync(path)) return undefined;
  try {
    const result = parseTomlConfig(await readFile(path, "utf8"));
    warnings.push(...result.warnings.map((warning) => `${path}: ${warning}`));
    return result.config;
  } catch (error) {
    warnings.push(`${path}: falha ao ler (${String(error)})`);
    return undefined;
  }
}

export async function loadConfig(cwd: string = process.cwd()): Promise<LoadedConfig> {
  const warnings: string[] = [];
  const paths = [userConfigPath(), projectConfigPath(cwd)];
  const sources: string[] = [];

  let config = defaultConfig;
  for (const path of paths) {
    const layer = await readLayer(path, warnings);
    if (layer === undefined) continue;
    config = mergeConfig(config, layer);
    sources.push(path);
  }

  return { config, sources, warnings };
}