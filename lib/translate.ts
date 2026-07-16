const DEFAULT_MODEL = "tencent/hy3:free";
// Kept just under the route's maxDuration so we surface our own error instead
// of letting the platform kill the function with an opaque 504.
const TIMEOUT_MS = 55000;

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

export type TranslationResult = TranslationOutput & {
  model: string;
  durationMs: number;
};

export class TranslationTimeoutError extends Error {
  constructor() {
    super("Translation timed out");
    this.name = "TranslationTimeoutError";
  }
}

const SYSTEM_PROMPT = `You translate content fields from English to Spanish for a personal website.

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

export async function translateToSpanish(
  input: TranslationInput
): Promise<TranslationResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }

  const model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const startedAt = Date.now();

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserMessage(input) },
        ],
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`Chat completions request failed: ${res.status}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (typeof content !== "string") {
      throw new Error("Chat completions response had no message content");
    }

    const output = parseTranslationResponse(content);
    const durationMs = Date.now() - startedAt;
    console.info(
      `Translated via OpenRouter ${model} in ${(durationMs / 1000).toFixed(1)}s`
    );
    return { ...output, model, durationMs };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new TranslationTimeoutError();
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
