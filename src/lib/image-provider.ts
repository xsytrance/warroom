const ENV_KEY_PREFIX = "WARROOM_IMAGE_PROVIDER_";

export function maskApiKey(apiKey: string | null | undefined): string | null {
  if (!apiKey) return null;
  const clean = apiKey.trim();
  if (!clean) return null;
  if (clean.length <= 8) return `${clean.slice(0, 2)}***${clean.slice(-1)}`;
  return `${clean.slice(0, 4)}...${clean.slice(-4)}`;
}

export function encodeApiKey(apiKey: string): string {
  return Buffer.from(apiKey, "utf8").toString("base64");
}

export function decodeApiKey(cipher: string | null | undefined): string | null {
  if (!cipher) return null;
  try {
    return Buffer.from(cipher, "base64").toString("utf8");
  } catch {
    return null;
  }
}

export function getProviderEnvKey(provider: string): string {
  return `${ENV_KEY_PREFIX}${provider.toUpperCase().replace(/[^A-Z0-9]/g, "_")}_KEY`;
}

export function resolveApiKey(provider: string, cipher: string | null | undefined): string | null {
  const envKey = process.env[getProviderEnvKey(provider)];
  if (envKey && envKey.trim().length > 0) return envKey.trim();
  return decodeApiKey(cipher);
}

export type ImageGenerationRequest = {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  seed?: string;
};

export type ImageGenerationResult = {
  provider: string;
  imageUrl: string;
  model?: string;
  latencyMs?: number;
  metadata?: Record<string, unknown>;
};

export async function generateImageViaProvider(options: {
  provider: string;
  baseUrl?: string | null;
  modelName?: string | null;
  apiKey?: string | null;
  request: ImageGenerationRequest;
}): Promise<ImageGenerationResult> {
  const started = Date.now();
  const { provider, request, baseUrl, modelName } = options;

  if (provider === "local-comfyui") {
    return {
      provider,
      model: modelName ?? "local-workflow",
      imageUrl: `${baseUrl ?? "http://127.0.0.1:8188"}/view?filename=placeholder.png&type=output`,
      latencyMs: Date.now() - started,
      metadata: {
        mode: "stub",
        note: "Hook ComfyUI prompt/workflow API here for production use.",
        request,
      },
    };
  }

  if (provider === "fal" || provider === "openai") {
    return {
      provider,
      model: modelName ?? "default",
      imageUrl: "",
      latencyMs: Date.now() - started,
      metadata: {
        mode: "stub",
        note: "Provider adapter ready. Connect real API call in generateImageViaProvider().",
        request,
      },
    };
  }

  throw new Error(`Unsupported provider '${provider}'.`);
}
