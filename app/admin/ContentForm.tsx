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
};

const EDITOR_HEIGHT = "720px";

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
  const listHref = kind === "post" ? "/admin" : "/admin/projects";

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

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inlineFileInputRef = useRef<HTMLInputElement>(null);
  const heroFileInputRef = useRef<HTMLInputElement>(null);

  async function uploadImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (!res.ok) return null;
    const data = await res.json();
    return data.url as string;
  }

  async function handleHeroImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setHeroUploading(true);
    const url = await uploadImage(file);
    setHeroUploading(false);

    if (!url) {
      setError("No se pudo subir la imagen");
      return;
    }
    setImageUrl(url);
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
    const url = await uploadImage(file);
    setInlineUploading(false);

    if (!url) {
      setError("No se pudo subir la imagen");
      return;
    }

    const caption = window.prompt("Pie de foto (déjalo vacío para no poner ninguno):", "");
    setTab("write");
    insertAtCursor(`![${caption ?? ""}](${url})`);
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
      ...(kind === "project"
        ? { repo_url: repoUrl || null, live_url: liveUrl || null, stage }
        : {}),
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
      setError(data?.error ?? "Ha ocurrido un error");
      return;
    }

    router.push(listHref);
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
              <option value="in_progress">En progreso</option>
              <option value="completed">Completado</option>
              <option value="archived">Archivado</option>
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
              aria-label="Eliminar imagen"
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
            Elegir archivo
          </button>
          <input
            ref={heroFileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleHeroImageChange}
          />
          {heroUploading && <span style={adminTypography.label}>Subiendo…</span>}
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
              {inlineUploading ? "Subiendo…" : "Insertar imagen"}
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

      <div className="flex flex-col gap-1.5">
        <span className="uppercase" style={adminTypography.label}>
          Status
        </span>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as "draft" | "published")}
          style={adminTypography.input}
        >
          <option value="draft">Borrador</option>
          <option value="published">Publicado</option>
        </select>
      </div>

      {error && <span style={{ ...adminTypography.label, color: "#a24b3f" }}>{error}</span>}

      <button
        type="submit"
        disabled={busy}
        className="w-fit uppercase"
        style={adminTypography.buttonPrimary}
      >
        {submitting ? "Guardando…" : heroUploading || inlineUploading ? "Esperando subida…" : "Guardar"}
      </button>
    </form>
  );
}
