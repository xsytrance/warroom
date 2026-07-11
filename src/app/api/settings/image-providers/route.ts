import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { maskApiKey, encodeApiKey } from "@/lib/image-provider";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const providers = await prisma.imageProviderSetting.findMany({
    orderBy: [{ priority: "asc" }, { provider: "asc" }],
  });

  return NextResponse.json({
    providers: providers.map((provider) => ({
      ...provider,
      apiKeyCipher: undefined,
    })),
  });
}

type UpdateProviderPayload = {
  provider: string;
  enabled?: boolean;
  priority?: number;
  baseUrl?: string | null;
  modelName?: string | null;
  apiKey?: string | null;
  localModelPath?: string | null;
  settings?: Record<string, unknown> | null;
};

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as UpdateProviderPayload;
  if (!payload.provider || typeof payload.provider !== "string") {
    return NextResponse.json({ error: "provider is required" }, { status: 400 });
  }

  const provider = payload.provider.trim().toLowerCase();
  const cipher = payload.apiKey ? encodeApiKey(payload.apiKey) : undefined;

  const record = await prisma.imageProviderSetting.upsert({
    where: { provider },
    update: {
      enabled: payload.enabled,
      priority: payload.priority,
      baseUrl: payload.baseUrl,
      modelName: payload.modelName,
      localModelPath: payload.localModelPath,
      apiKeyMasked: payload.apiKey ? maskApiKey(payload.apiKey) : undefined,
      apiKeyCipher: cipher,
      settingsJson: payload.settings ? JSON.stringify(payload.settings) : undefined,
    },
    create: {
      provider,
      enabled: payload.enabled ?? false,
      priority: payload.priority ?? 100,
      baseUrl: payload.baseUrl ?? null,
      modelName: payload.modelName ?? null,
      localModelPath: payload.localModelPath ?? null,
      apiKeyMasked: payload.apiKey ? maskApiKey(payload.apiKey) : null,
      apiKeyCipher: cipher ?? null,
      settingsJson: payload.settings ? JSON.stringify(payload.settings) : null,
    },
  });

  return NextResponse.json({ provider: { ...record, apiKeyCipher: undefined } });
}
