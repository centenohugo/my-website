"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import MarkdownContent from "../MarkdownContent";
import { ImageIcon, TrashIcon, UploadIcon } from "./icons";
import { adminColors, adminTypography } from "./theme";

export type ContentStage = "in_progress" | "completed" | "archived";

export type ContentFormInitialData = {
  slug: string;
  title: string;
  subtitle: string | null;
  content: string;
  status: "draft" | "published";
  image_url: string | null;
  repo_url?: string | null;
  live_url?: string | null;
  stage?: ContentStage;
  title_es?: string | null;
  subtitle_es?: string | null;
  content_es?: string | null;
  asset_prefix?: string | null;
};

const EDITOR_HEIGHT = "720px";

// Vercel serverless functions reject request bodies over ~4.5 MB, so we
// downscale + re-encode to WebP in the browser before sending the upload.
// The server still runs sharp on the result as a second pass.
const MAX_DIMENSION = 2000;
const WEBP_QUALITY = 0.82;

async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", WEBP_QUALITY)
    );
    if (!blob) return file;

    const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
    return new File([blob], name, { type: "image/webp" });
  } catch {
    // If anything goes wrong (unsupported format, etc.) fall back to the
    // original file and let the server decide.
    return file;
  }
}

export default function ContentForm({
  kind,
  mode,
  initialData,
}: {
  kind: "post" | "project";
  mode: "create" | "edit";
  initialData?: ContentFormInitialData;
}) {
  const router = useRouter();
  const apiBase = kind === "post" ? "/api/posts" : "/api/projects";
  const listHref = kind === "post" ? "/admin" : "/admin?tab=projects";

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [subtitle, setSubtitle] = useState(initialData?.subtitle ?? "");
  const [content, setContent] = useState(initialData?.content ?? "");
  const [status, setStatus] = useState<"draft" | "published">(
    initialData?.status ?? "draft"
  );
  const [imageUrl, setImageUrl] = useState(initialData?.image_url ?? "");
  const [repoUrl, setRepoUrl] = useState(initialData?.repo_url ?? "");
  const [liveUrl, setLiveUrl] = useState(initialData?.live_url ?? "");
  const [stage, setStage] = useState<ContentStage>(initialData?.stage ?? "in_progress");
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [heroUploading, setHeroUploading] = useState(false);
  const [inlineUploading, setInlineUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Immutable id for this article's blob folder (posts/<id>/ or
  // projects/<id>/). Generated once per new article; articles created before
  // the folder scheme get one on their first edit that uploads an image.
  const [assetPrefix] = useState(
    () => initialData?.asset_prefix ?? crypto.randomUUID()
  );

  const [titleEs, setTitleEs] = useState(initialData?.title_es ?? "");
  const [subtitleEs, setSubtitleEs] = useState(initialData?.subtitle_es ?? "");
  const [contentEs, setContentEs] = useState(initialData?.content_es ?? "");
  const [esTab, setEsTab] = useState<"write" | "preview">("write");
  const [translating, setTranslating] = useState(false);
  const [translateError, setTranslateError] = useState<string | null>(null);
  const [translatedBy, setTranslatedBy] = useState<string | null>(null);
  const [translationSource, setTranslationSource] = useState<
    "local" | "openrouter" | null
  >(null);
  const [translationMs, setTranslationMs] = useState<number | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inlineFileInputRef = useRef<HTMLInputElement>(null);
  const heroFileInputRef = useRef<HTMLInputElement>(null);

  async function uploadImage(file: File): Promise<string> {
    const compressed = await compressImage(file);
    const formData = new FormData();
    formData.append("file", compressed);
    formData.append("kind", kind);
    formData.append("assetId", assetPrefix);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.error ?? `Upload failed (${res.status})`);
    }
    const data = await res.json();
    return data.url as string;
  }

  async function handleHeroImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setHeroUploading(true);
    setError(null);
    try {
      const url = await uploadImage(file);
      setImageUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't upload the image");
    } finally {
      setHeroUploading(false);
    }
  }

  function insertAtCursor(text: string) {
    const textarea = textareaRef.current;
    if (!textarea) {
      setContent((prev) => `${prev}\n\n${text}\n\n`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const next = `${content.slice(0, start)}\n\n${text}\n\n${content.slice(end)}`;
    setContent(next);

    requestAnimationFrame(() => {
      const cursor = start + text.length + 4;
      textarea.focus();
      textarea.setSelectionRange(cursor, cursor);
    });
  }

  async function handleInlineImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setInlineUploading(true);
    setError(null);
    let url: string;
    try {
      url = await uploadImage(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't upload the image");
      return;
    } finally {
      setInlineUploading(false);
    }

    const caption = window.prompt("Caption (leave empty for none):", "");
    setTab("write");
    insertAtCursor(`![${caption ?? ""}](${url})`);
  }

  async function handleTranslate() {
    setTranslating(true);
    setTranslateError(null);
    setTranslatedBy(null);
    setTranslationSource(null);
    setTranslationMs(null);

    const res = await fetch("/api/posts/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, subtitle: subtitle || null, content }),
    });

    setTranslating(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setTranslateError(data?.error ?? "Translation failed");
      return;
    }

    const data = await res.json();
    setTitleEs(data.title_es ?? "");
    setSubtitleEs(data.subtitle_es ?? "");
    setContentEs(data.content_es ?? "");
    setTranslatedBy(data.translated_by ?? null);
    setTranslationSource(data.source ?? null);
    setTranslationMs(typeof data.duration_ms === "number" ? data.duration_ms : null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const body = {
      title,
      subtitle: subtitle || null,
      content,
      status,
      image_url: imageUrl || null,
      asset_prefix: assetPrefix,
      ...(kind === "project"
        ? { repo_url: repoUrl || null, live_url: liveUrl || null, stage }
        : {
            title_es: titleEs || null,
            subtitle_es: subtitleEs || null,
            content_es: contentEs || null,
          }),
    };

    const res = await fetch(
      mode === "create" ? apiBase : `${apiBase}/${initialData!.slug}`,
      {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      setSubmitting(false);
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "An error occurred");
      return;
    }

    // Replace the edit/new entry: the slug may have changed on save, so going
    // back to the old edit URL would 404.
    router.replace(listHref);
    router.refresh();
  }

  const busy = submitting || heroUploading || inlineUploading;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <span className="uppercase" style={adminTypography.label}>
          Title
        </span>
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          style={adminTypography.input}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="uppercase" style={adminTypography.label}>
          Subtitle
        </span>
        <input
          type="text"
          value={subtitle}
          onChange={(event) => setSubtitle(event.target.value)}
          style={adminTypography.input}
        />
      </div>

      {kind === "project" && (
        <>
          <div className="flex flex-col gap-1.5">
            <span className="uppercase" style={adminTypography.label}>
              Repo URL
            </span>
            <input
              type="url"
              value={repoUrl}
              onChange={(event) => setRepoUrl(event.target.value)}
              style={adminTypography.input}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="uppercase" style={adminTypography.label}>
              Live URL
            </span>
            <input
              type="url"
              value={liveUrl}
              onChange={(event) => setLiveUrl(event.target.value)}
              style={adminTypography.input}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="uppercase" style={adminTypography.label}>
              Stage
            </span>
            <select
              value={stage}
              onChange={(event) => setStage(event.target.value as ContentStage)}
              style={adminTypography.input}
            >
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </>
      )}

      <div className="flex flex-col gap-1.5">
        <span className="uppercase" style={adminTypography.label}>
          Image
        </span>
        {imageUrl && (
          <div className="relative w-fit">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt=""
              className="aspect-[3/2] w-48 overflow-hidden object-cover"
              style={{ borderRadius: "3px" }}
            />
            <button
              type="button"
              onClick={() => setImageUrl("")}
              aria-label="Remove image"
              className="absolute flex items-center justify-center"
              style={{
                top: "6px",
                right: "6px",
                width: "24px",
                height: "24px",
                borderRadius: "3px",
                backgroundColor: adminColors.paper,
                color: adminColors.textMuted,
                cursor: "pointer",
              }}
            >
              <TrashIcon />
            </button>
          </div>
        )}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => heroFileInputRef.current?.click()}
            disabled={heroUploading}
            className="flex w-fit items-center gap-2 uppercase"
            style={{ ...adminTypography.tab, cursor: "pointer" }}
          >
            <UploadIcon />
            Choose file
          </button>
          <input
            ref={heroFileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleHeroImageChange}
          />
          {heroUploading && <span style={adminTypography.label}>Uploading…</span>}
        </div>
      </div>

      <div
        className="flex flex-col gap-1.5"
        style={{ width: "1200px", maxWidth: "calc(100vw - 88px)" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => inlineFileInputRef.current?.click()}
              disabled={inlineUploading}
              className="flex items-center gap-1.5 uppercase"
              style={{ ...adminTypography.tab, cursor: "pointer" }}
            >
              <ImageIcon />
              {inlineUploading ? "Uploading…" : "Insert image"}
            </button>
            <input
              ref={inlineFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleInlineImageChange}
            />
            <span aria-hidden style={{ color: adminTypography.tab.color }}>
              |
            </span>
            <button
              type="button"
              onClick={() => setTab("write")}
              className="uppercase"
              style={tab === "write" ? adminTypography.tabActive : adminTypography.tab}
            >
              Write
            </button>
            <button
              type="button"
              onClick={() => setTab("preview")}
              className="uppercase"
              style={tab === "preview" ? adminTypography.tabActive : adminTypography.tab}
            >
              Preview
            </button>
          </div>
        </div>

        <div style={{ display: tab === "write" ? "block" : "none" }}>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            required
            style={{ ...adminTypography.textarea, height: EDITOR_HEIGHT, width: "100%", resize: "vertical" }}
          />
        </div>

        <div
          style={{
            ...adminTypography.textarea,
            height: EDITOR_HEIGHT,
            overflowY: "auto",
            display: tab === "preview" ? "block" : "none",
          }}
        >
          <MarkdownContent content={content} />
        </div>
      </div>

      {kind === "post" && (
        <div
          className="flex flex-col gap-4"
          style={{ width: "1200px", maxWidth: "calc(100vw - 88px)" }}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleTranslate}
              disabled={translating || !title || !content}
              className="w-fit uppercase"
              style={adminTypography.buttonPrimary}
            >
              {translating ? "Translating…" : "Generate Spanish translation"}
            </button>
            {translateError && (
              <span style={{ ...adminTypography.label, color: "#a24b3f" }}>
                {translateError}
              </span>
            )}
            {translatedBy && (
              <span
                style={{
                  ...adminTypography.label,
                  color: translationSource === "local" ? "#3f7a4b" : "#a2803f",
                }}
              >
                {translationSource === "local" ? "✓" : "⚠"} Traducido por:{" "}
                {translatedBy}
                {translationMs !== null &&
                  ` · ${(translationMs / 1000).toFixed(1)}s`}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="uppercase" style={adminTypography.label}>
              Title (ES)
            </span>
            <input
              type="text"
              value={titleEs}
              onChange={(event) => setTitleEs(event.target.value)}
              style={adminTypography.input}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="uppercase" style={adminTypography.label}>
              Subtitle (ES)
            </span>
            <input
              type="text"
              value={subtitleEs}
              onChange={(event) => setSubtitleEs(event.target.value)}
              style={adminTypography.input}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setEsTab("write")}
                className="uppercase"
                style={esTab === "write" ? adminTypography.tabActive : adminTypography.tab}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setEsTab("preview")}
                className="uppercase"
                style={esTab === "preview" ? adminTypography.tabActive : adminTypography.tab}
              >
                Preview
              </button>
            </div>

            <div style={{ display: esTab === "write" ? "block" : "none" }}>
              <textarea
                value={contentEs}
                onChange={(event) => setContentEs(event.target.value)}
                style={{ ...adminTypography.textarea, height: EDITOR_HEIGHT, width: "100%", resize: "vertical" }}
              />
            </div>

            <div
              style={{
                ...adminTypography.textarea,
                height: EDITOR_HEIGHT,
                overflowY: "auto",
                display: esTab === "preview" ? "block" : "none",
              }}
            >
              <MarkdownContent content={contentEs} />
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <span className="uppercase" style={adminTypography.label}>
          Status
        </span>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as "draft" | "published")}
          style={adminTypography.input}
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      {error && <span style={{ ...adminTypography.label, color: "#a24b3f" }}>{error}</span>}

      <button
        type="submit"
        disabled={busy}
        className="w-fit uppercase"
        style={adminTypography.buttonPrimary}
      >
        {submitting ? "Saving…" : heroUploading || inlineUploading ? "Waiting for upload…" : "Save"}
      </button>
    </form>
  );
}
