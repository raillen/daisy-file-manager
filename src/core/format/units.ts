import type { Translator } from "../i18n/translator";

const unitScales: ReadonlyArray<{ limit: number; key: "units.kilobytes" | "units.megabytes" | "units.gigabytes" | "units.terabytes" }> = [
  { limit: 1024, key: "units.kilobytes" },
  { limit: 1024 ** 2, key: "units.megabytes" },
  { limit: 1024 ** 3, key: "units.gigabytes" },
];

export function formatBytes(bytes: number | undefined, t: Translator): string {
  if (bytes === undefined || Number.isNaN(bytes)) return t("units.unknown");
  if (bytes < 1024) return `${bytes} ${t("units.bytes")}`;

  let value = bytes;
  let unitKey: "units.kilobytes" | "units.megabytes" | "units.gigabytes" | "units.terabytes" = "units.kilobytes";
  for (const scale of unitScales) {
    if (bytes >= scale.limit) {
      value = bytes / scale.limit;
      unitKey = scale.key;
    }
  }
  const rounded = value >= 100 ? Math.round(value).toString() : value.toFixed(1);
  return `${rounded} ${t(unitKey)}`;
}

export function formatDate(timestampMs: number | undefined, locale: string): string {
  if (timestampMs === undefined || Number.isNaN(timestampMs)) return "—";
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(timestampMs));
}