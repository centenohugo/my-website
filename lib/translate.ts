const LOCAL_TIMEOUT_MS = 4000;
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
}: {
  baseUrl: string;
  model: string;
  apiKey?: string;
  input: TranslationInput;
  signal?: AbortSignal;
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

async function tryLocalModel(input: TranslationInput): Promise<TranslationOutput | null> {
  const baseUrl = process.env.LOCAL_LLM_URL;
  if (!baseUrl) return null;

  const model = process.env.LOCAL_LLM_MODEL || "local-model";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), LOCAL_TIMEOUT_MS);

  try {
    return await callChatCompletions({
      baseUrl: `${baseUrl}/v1`,
      model,
      input,
      signal: controller.signal,
    });
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function translateViaOpenRouter(input: TranslationInput): Promise<TranslationOutput> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }

  return callChatCompletions({
    baseUrl: "https://openrouter.ai/api/v1",
    model: OPENROUTER_MODEL,
    apiKey,
    input,
  });
}

export async function translateToSpanish(input: TranslationInput): Promise<TranslationOutput> {
  const local = await tryLocalModel(input);
  if (local) return local;

  return translateViaOpenRouter(input);
}
