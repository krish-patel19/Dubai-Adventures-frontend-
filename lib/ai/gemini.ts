import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  DEFAULT_GEMINI_CHAT_MODEL,
  getGeminiModelCandidates,
  migrateGeminiModelName,
  normalizeGeminiModelName,
} from "@/lib/ai/gemini-models";

const GEMINI_MODEL_CATALOG_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const MODEL_CACHE_TTL_MS = 10 * 60 * 1000;

type GeminiHistoryEntry = {
  role: "user" | "model";
  parts: Array<{ text: string }>;
};

type GeminiPromptPart = {
  text: string;
};

type GeminiModelsResponse = {
  models?: Array<{
    name?: string;
    supportedGenerationMethods?: string[];
  }>;
};

interface GeminiModelCache {
  expiresAt: number;
  models: string[];
  promise: Promise<string[]> | null;
}

declare global {
  var dubaiAdventuresGeminiModelCache: GeminiModelCache | undefined;
}

const modelCache = globalThis.dubaiAdventuresGeminiModelCache ?? {
  expiresAt: 0,
  models: [],
  promise: null,
};

globalThis.dubaiAdventuresGeminiModelCache = modelCache;

function uniqueModels(models: Array<string | null | undefined>) {
  return Array.from(new Set(models.filter((model): model is string => Boolean(model))));
}

function scoreDiscoveredModel(model: string) {
  let score = model.startsWith("gemini") ? 500 : 0;

  if (model === DEFAULT_GEMINI_CHAT_MODEL) {
    score += 1000;
  }
  if (model === "gemini-2.5-flash") {
    score += 900;
  }
  if (model === "gemini-2.0-flash") {
    score += 800;
  }
  if (model === "gemini-pro-latest") {
    score += 700;
  }
  if (model.includes("flash")) {
    score += 100;
  }
  if (model.includes("pro")) {
    score += 60;
  }
  if (model.includes("preview") || model.includes("exp")) {
    score -= 120;
  }
  if (model.includes("lite")) {
    score -= 20;
  }
  if (model.includes("audio") || model.includes("tts") || model.includes("live") || model.includes("embedding")) {
    score -= 250;
  }

  return score;
}

async function fetchGenerateContentModels(apiKey: string) {
  if (modelCache.models.length && modelCache.expiresAt > Date.now()) {
    return modelCache.models;
  }

  if (!modelCache.promise) {
    modelCache.promise = (async () => {
      const response = await fetch(`${GEMINI_MODEL_CATALOG_URL}?key=${apiKey}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Gemini model catalog lookup failed with status ${response.status}.`);
      }

      const payload = (await response.json()) as GeminiModelsResponse;
      return uniqueModels(
        (payload.models || [])
          .filter((model) => model.supportedGenerationMethods?.includes("generateContent"))
          .map((model) => normalizeGeminiModelName(model.name))
      );
    })();
  }

  try {
    const models = await modelCache.promise;
    modelCache.models = models;
    modelCache.expiresAt = Date.now() + MODEL_CACHE_TTL_MS;
    return models;
  } finally {
    modelCache.promise = null;
  }
}

function buildCandidateModels(preferredModel?: string | null, discoveredModels?: string[]) {
  const baseCandidates = getGeminiModelCandidates(preferredModel);
  if (!discoveredModels?.length) {
    return baseCandidates;
  }

  const availableModels = new Set(discoveredModels);
  const exactMatches = baseCandidates.filter((model) => availableModels.has(model));
  const rankedFallbacks = [...discoveredModels]
    .filter((model) => model.startsWith("gemini"))
    .sort((left, right) => scoreDiscoveredModel(right) - scoreDiscoveredModel(left));

  return uniqueModels([...exactMatches, ...rankedFallbacks, ...baseCandidates]);
}

export async function resolveGeminiModelCandidates(apiKey: string, preferredModel?: string | null) {
  try {
    const discoveredModels = await fetchGenerateContentModels(apiKey);
    return buildCandidateModels(preferredModel, discoveredModels);
  } catch (error) {
    console.warn("[Gemini] Falling back to static model candidates after catalog lookup failed.", error);
    return buildCandidateModels(preferredModel);
  }
}

function getGeminiErrorText(error: any) {
  return [
    error?.message,
    error?.statusText,
    error?.details,
    JSON.stringify(error?.errorDetails ?? null),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function isGeminiModelUnavailableError(error: any) {
  const errorText = getGeminiErrorText(error);
  return (
    error?.status === 404 ||
    errorText.includes("call listmodels") ||
    errorText.includes("not found for api version") ||
    errorText.includes("is not supported") ||
    errorText.includes("unsupported model")
  );
}

export function isGeminiCredentialError(error: any) {
  const errorText = getGeminiErrorText(error);
  return (
    error?.status === 401 ||
    error?.status === 403 ||
    errorText.includes("api key") ||
    errorText.includes("authentication") ||
    errorText.includes("unauthenticated") ||
    errorText.includes("permission denied")
  );
}

export function isGeminiRateLimitError(error: any) {
  const errorText = getGeminiErrorText(error);
  return (
    error?.status === 429 ||
    error?.status === 503 ||
    errorText.includes("quota") ||
    errorText.includes("rate limit") ||
    errorText.includes("high demand") ||
    errorText.includes("resource exhausted") ||
    errorText.includes("service unavailable") ||
    errorText.includes("try again later")
  );
}

export async function generateGeminiChatText({
  apiKey,
  preferredModel,
  systemInstruction,
  history,
  message,
}: {
  apiKey: string;
  preferredModel?: string | null;
  systemInstruction: string;
  history: GeminiHistoryEntry[];
  message: string;
}) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const requestedModel = migrateGeminiModelName(preferredModel);
  let lastError: unknown = null;

  for (const candidateModel of await resolveGeminiModelCandidates(apiKey, preferredModel)) {
    try {
      const model = genAI.getGenerativeModel({
        model: candidateModel,
        systemInstruction,
      });
      const chat = model.startChat({ history });
      const result = await chat.sendMessage(message);
      const response = await result.response;
      const text = response.text().trim();

      if (!text) {
        throw new Error("Empty response from Gemini.");
      }

      return {
        model: candidateModel,
        requestedModel,
        text,
      };
    } catch (error) {
      lastError = error;

      if (isGeminiModelUnavailableError(error) || isGeminiRateLimitError(error)) {
        console.warn(`[Gemini] Model "${candidateModel}" could not serve the request. Trying the next supported model.`);
        continue;
      }

      throw error;
    }
  }

  throw lastError ?? new Error("No supported Gemini text model is currently available.");
}

export async function generateGeminiContentText({
  apiKey,
  preferredModel,
  systemInstruction,
  promptParts,
}: {
  apiKey: string;
  preferredModel?: string | null;
  systemInstruction: string;
  promptParts: GeminiPromptPart[];
}) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const requestedModel = migrateGeminiModelName(preferredModel);
  let lastError: unknown = null;

  for (const candidateModel of await resolveGeminiModelCandidates(apiKey, preferredModel)) {
    try {
      const model = genAI.getGenerativeModel({
        model: candidateModel,
        systemInstruction,
      });
      const result = await model.generateContent(promptParts);
      const text = result.response.text().trim();

      if (!text) {
        throw new Error("Empty response from Gemini.");
      }

      return {
        model: candidateModel,
        requestedModel,
        text,
      };
    } catch (error) {
      lastError = error;

      if (isGeminiModelUnavailableError(error) || isGeminiRateLimitError(error)) {
        console.warn(`[Gemini] Model "${candidateModel}" could not serve the request. Trying the next supported model.`);
        continue;
      }

      throw error;
    }
  }

  throw lastError ?? new Error("No supported Gemini text model is currently available.");
}
