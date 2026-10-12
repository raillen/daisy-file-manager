import enUS from "../../../design/i18n/en-US.json" with { type: "json" };
import ptBR from "../../../design/i18n/pt-BR.json" with { type: "json" };

export type LocaleCode = "pt-BR" | "en-US";

type Dictionary = typeof ptBR;
type DictionaryLeaf = string | Record<string, unknown>;

export type MessageValue = string | number;
export type MessageParams = Readonly<Record<string, MessageValue>>;

export const localeCodes: Record<LocaleCode, string> = {
  "pt-BR": ptBR.name,
  "en-US": enUS.name,
};

const dictionaries: Record<LocaleCode, Dictionary> = {
  "pt-BR": ptBR,
  "en-US": enUS as Dictionary,
};

export const defaultLocale: LocaleCode = "pt-BR";

function resolvePath(dictionary: Dictionary, key: string): DictionaryLeaf | undefined {
  let current: unknown = dictionary;
  for (const segment of key.split(".")) {
    if (typeof current !== "object" || current === null) return undefined;
    current = (current as Record<string, unknown>)[segment];
  }
  if (typeof current === "string") return current;
  if (typeof current === "object" && current !== null) return current as Record<string, unknown>;
  return undefined;
}

function pickPlural(node: Record<string, unknown>, params: MessageParams): string | undefined {
  const count = params.count;
  const candidates = typeof count === "number" ? [count === 1 ? "one" : "other", "other", "one"] : ["other", "one"];
  for (const candidate of candidates) {
    const value = node[candidate];
    if (typeof value === "string") return value;
  }
  return undefined;
}

export function interpolate(template: string, params: MessageParams): string {
  return template.replace(/\{(\w+)\}/g, (match, token: string) => {
    const value = params[token];
    return value === undefined ? match : String(value);
  });
}

export type Translator = (key: string, params?: MessageParams) => string;

export function createTranslator(locale: LocaleCode): Translator {
  const dictionary = dictionaries[locale];
  return (key, params = {}) => {
    const node = resolvePath(dictionary, key);
    if (node === undefined) return key;
    if (typeof node === "string") return interpolate(node, params);
    const plural = pickPlural(node, params);
    return plural === undefined ? key : interpolate(plural, params);
  };
}

export type { Dictionary };