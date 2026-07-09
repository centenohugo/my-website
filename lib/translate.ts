const LOCAL_TIMEOUT_MS = 120000;
const OPENROUTER_MODEL = "tencent/hy3:free";

type TranslationInput = {
  title: string;
  subtitle: string | null;
  content: string;
};

type TranslationOutput = {
  title: string;
  subtitle: string | null;
  content: string;
};

export type TranslationSource = "local" | "openrouter";

export type TranslationResult = TranslationOutput & {
  source: TranslationSource;
  model: string;
  durationMs: number;
};

const SYSTEM_PROMPT = `You translate blog post fields from English to Spanish for a personal website.

Rules:
- Translate naturally, keeping the author's tone and meaning.
- Preserve all Markdown structure exactly: headings, bold/italic, lists, links, image syntax ![alt](url), inline code, and code blocks. Do not translate URLs, code, or code block contents. You may translate image alt text.
- Reply with ONLY a JSON object, no code fences, no commentary, in this exact shape:
{"title": "...", "subtitle": "..." or null, "content": "..."}`;

function buildUserMessage(input: TranslationInput) {
  return JSON.stringify({
    title: input.title,
    subtitle: input.subtitle,
    content: input.content,
  });
}

function parseTranslationResponse(raw: string): TranslationOutput {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Translation model returned invalid JSON");
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    typeof (parsed as Record<string, unknown>).title !== "string" ||
    typeof (parsed as Record<string, unknown>).content !== "string"
  ) {
    throw new Error("Translation model returned an unexpected shape");
  }

  const result = parsed as Record<string, unknown>;
  return {
    title: result.title as string,
    subtitle: typeof result.subtitle === "string" ? result.subtitle : null,
    content: result.content as string,
  };
}

async function callChatCompletions({
  baseUrl,
  model,
  apiKey,
  input,
  signal,
  jsonMode,
}: {
  baseUrl: string;
  model: string;
  apiKey?: string;
  input: TranslationInput;
  signal?: AbortSignal;
  jsonMode?: boolean;
}): Promise<TranslationOutput> {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserMessage(input) },
      ],
      // Small local models drift out of JSON; ask the runtime to enforce it.
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
    signal,
  });

  if (!res.ok) {
    throw new Error(`Chat completions request failed: ${res.status}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("Chat completions response had no message content");
  }

  return parseTranslationResponse(content);
}

async function tryLocalModel(input: TranslationInput): Promise<TranslationResult | null> {
  const baseUrl = process.env.LOCAL_LLM_URL;
  if (!baseUrl) return null;

  const model = process.env.LOCAL_LLM_MODEL || "local-model";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), LOCAL_TIMEOUT_MS);
  const startedAt = Date.now();

  try {
    const output = await callChatCompletions({
      baseUrl: `${baseUrl}/v1`,
      model,
      input,
      signal: controller.signal,
      jsonMode: true,
    });
    const durationMs = Date.now() - startedAt;
    console.info(`Translated via local model ${model} in ${(durationMs / 1000).toFixed(1)}s`);
    return { ...output, source: "local", model, durationMs };
  } catch (error) {
    const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
    const reason =
      error instanceof Error && error.name === "AbortError"
        ? `timed out after ${LOCAL_TIMEOUT_MS}ms`
        : error instanceof Error
          ? error.message
          : "unknown error";
    console.warn(`Local translation model unavailable after ${elapsed}s (${reason}); falling back to OpenRouter`);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function translateViaOpenRouter(input: TranslationInput): Promise<TranslationResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }

  const startedAt = Date.now();
  const output = await callChatCompletions({
    baseUrl: "https://openrouter.ai/api/v1",
    model: OPENROUTER_MODEL,
    apiKey,
    input,
  });
  const durationMs = Date.now() - startedAt;
  console.info(`Translated via OpenRouter ${OPENROUTER_MODEL} in ${(durationMs / 1000).toFixed(1)}s`);
  return { ...output, source: "openrouter", model: OPENROUTER_MODEL, durationMs };
}

export async function translateToSpanish(input: TranslationInput): Promise<TranslationResult> {
  const local = await tryLocalModel(input);
  if (local) return local;

  return translateViaOpenRouter(input);
}
