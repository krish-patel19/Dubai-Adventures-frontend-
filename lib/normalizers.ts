export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function normalizeText(value: string) {
  return value.trim();
}

export function normalizeOptionalText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}
