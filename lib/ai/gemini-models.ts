export const DEFAULT_GEMINI_CHAT_MODEL = "gemini-flash-latest";

export const FALLBACK_GEMINI_CHAT_MODELS = [
  DEFAULT_GEMINI_CHAT_MODEL,
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-pro-latest",
] as const;

const LEGACY_GEMINI_MODEL_MIGRATIONS: Record<string, string> = {
  "gemini-1.5-flash": DEFAULT_GEMINI_CHAT_MODEL,
  "gemini-1.5-flash-latest": DEFAULT_GEMINI_CHAT_MODEL,
  "gemini-1.5-pro": "gemini-pro-latest",
  "gemini-1.5-pro-latest": "gemini-pro-latest",
  "gemini-2.0-flash-exp": "gemini-2.0-flash",
};

function uniqueModels(models: Array<string | null | undefined>) {
  return Array.from(new Set(models.filter((model): model is string => Boolean(model))));
}

export function normalizeGeminiModelName(model?: string | null) {
  const trimmed = typeof model === "string" ? model.trim() : "";
  if (!trimmed) {
    return null;
  }

  return trimmed.replace(/^models\//i, "");
}

export function migrateGeminiModelName(model?: string | null) {
  const normalizedModel = normalizeGeminiModelName(model);
  if (!normalizedModel) {
    return DEFAULT_GEMINI_CHAT_MODEL;
  }

  return LEGACY_GEMINI_MODEL_MIGRATIONS[normalizedModel] ?? normalizedModel;
}

export function getGeminiModelCandidates(model?: string | null) {
  return uniqueModels([migrateGeminiModelName(model), ...FALLBACK_GEMINI_CHAT_MODELS]);
}
