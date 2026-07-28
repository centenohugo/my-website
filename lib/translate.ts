// A :free model is one pool shared by every OpenRouter user, so it answers or
// 429s depending on what strangers are doing that minute — and free variants
// get retired outright without notice. Neither is survivable on a single
// model, so try several across different providers. Ordered by translation
// quality on a sample article; OPENROUTER_MODEL overrides (comma-separated).
// Reasoning models are deliberately last: this is a mechanical translation,
// and one that thinks for 800 tokens first sometimes spends the whole budget
// reasoning and returns empty content.
const DEFAULT_MODELS = [
  "inclusionai/ling-3.0-flash:free",
  "google/gemma-4-31b-it:free",
  "openai/gpt-oss-20b:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
];
// Kept just under the route's maxDuration so we surface our own error instead
// of letting the platform kill the function with an opaque 504. It is the
// budget for the whole chain, not per attempt — the caller is a human waiting
// on a button, and they don't care which model eventually answered.
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

class UpstreamError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "UpstreamError";
  }
}

// OpenRouter wraps the provider's own words in error.metadata.raw — that is
// where "temporarily rate-limited upstream" lives, and it is the difference
// between a bad key and a busy pool.
function describeFailure(status: number, body: string) {
  let reason = "";
  try {
    const parsed = JSON.parse(body);
    reason = parsed?.error?.metadata?.raw || parsed?.error?.message || "";
  } catch {
    reason = body.slice(0, 160);
  }
  return `request failed: ${status}${reason ? ` — ${reason}` : ""}`;
}

async function requestTranslation(
  model: string,
  input: TranslationInput,
  apiKey: string,
  signal: AbortSignal
): Promise<TranslationOutput> {
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
    signal,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new UpstreamError(res.status, describeFailure(res.status, body));
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("Chat completions response had no message content");
  }

  return parseTranslationResponse(content);
}

export async function translateToSpanish(
  input: TranslationInput
): Promise<TranslationResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }

  const models =
    process.env.OPENROUTER_MODEL?.split(",")
      .map((model) => model.trim())
      .filter(Boolean) ?? DEFAULT_MODELS;

  const deadline = Date.now() + TIMEOUT_MS;
  let lastError: unknown;

  for (const model of models) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) throw new TranslationTimeoutError();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), remaining);
    const startedAt = Date.now();

    try {
      const output = await requestTranslation(
        model,
        input,
        apiKey,
        controller.signal
      );
      const durationMs = Date.now() - startedAt;
      console.info(
        `Translated via OpenRouter ${model} in ${(durationMs / 1000).toFixed(1)}s`
      );
      return { ...output, model, durationMs };
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new TranslationTimeoutError();
      }
      // A rejected key fails identically on every model, so trying the rest
      // just burns the caller's remaining seconds.
      if (
        error instanceof UpstreamError &&
        (error.status === 401 || error.status === 403)
      ) {
        throw error;
      }
      lastError = error;
      const reason = error instanceof Error ? error.message : "unknown error";
      console.warn(`Translation via ${model} failed (${reason}); trying next`);
    } finally {
      clearTimeout(timeout);
    }
  }

  const reason = lastError instanceof Error ? lastError.message : "unknown error";
  throw new Error(`all ${models.length} models failed, last: ${reason}`);
}
