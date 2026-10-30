"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { aboutLayout } from "../about/theme";
import { adminColors, adminTypography } from "./theme";

// The working area. The preview beside it is drawn at the landing's real size.
const VIEWPORT = 280;
const MAX_ZOOM = 4;
// Matches PHOTO_SIZE in app/api/profile/photo/route.ts, so the server's resize
// is a no-op on anything that came through here.
const OUTPUT = 640;

/**
 * Zoom is relative to the smallest scale that still covers the square; the
 * offset is a fraction of the square's side, so one view draws the same crop
 * at any size — the working area, the preview and the exported file.
 */
type View = { zoom: number; x: number; y: number };

function clampView(view: View, bitmap: ImageBitmap): View {
  const zoom = Math.min(MAX_ZOOM, Math.max(1, view.zoom));
  const short = Math.min(bitmap.width, bitmap.height);
  // How far the image may slide before an edge shows inside the square.
  const maxX = ((bitmap.width / short) * zoom - 1) / 2;
  const maxY = ((bitmap.height / short) * zoom - 1) / 2;
  return {
    zoom,
    x: Math.min(maxX, Math.max(-maxX, view.x)),
    y: Math.min(maxY, Math.max(-maxY, view.y)),
  };
}

function draw(canvas: HTMLCanvasElement, bitmap: ImageBitmap, view: View) {
  const size = canvas.width;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const scale = (size / Math.min(bitmap.width, bitmap.height)) * view.zoom;
  const w = bitmap.width * scale;
  const h = bitmap.height * scale;
  ctx.imageSmoothingQuality = "high";
  ctx.clearRect(0, 0, size, size);
  ctx.drawImage(bitmap, (size - w) / 2 + view.x * size, (size - h) / 2 + view.y * size, w, h);
}

export default function PhotoCropper({
  file,
  busy,
  onCancel,
  onConfirm,
}: {
  file: File;
  busy: boolean;
  onCancel: () => void;
  onConfirm: (photo: Blob) => void;
}) {
  const [bitmap, setBitmap] = useState<ImageBitmap | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [view, setView] = useState<View>({ zoom: 1, x: 0, y: 0 });

  const areaRef = useRef<HTMLDivElement>(null);
  const workCanvas = useRef<HTMLCanvasElement>(null);
  const previewCanvas = useRef<HTMLCanvasElement>(null);
  const drag = useRef<{ pointerId: number; x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  // Decoded once with the EXIF rotation applied, so a phone photo taken
  // sideways crops the way it looks.
  useEffect(() => {
    let cancelled = false;
    let decoded: ImageBitmap | null = null;
    createImageBitmap(file, { imageOrientation: "from-image" })
      .then((result) => {
        if (cancelled) return result.close();
        decoded = result;
        setBitmap(result);
        setView({ zoom: 1, x: 0, y: 0 });
      })
      .catch(() => {
        if (!cancelled) setLoadError("This browser can't read that image. Try a JPEG or PNG.");
      });
    return () => {
      cancelled = true;
      decoded?.close();
    };
  }, [file]);

  const updateView = useCallback(
    (next: (view: View) => View) => {
      if (bitmap) setView((current) => clampView(next(current), bitmap));
    },
    [bitmap]
  );

  useEffect(() => {
    if (!bitmap) return;
    for (const canvas of [workCanvas.current, previewCanvas.current]) {
      if (canvas) draw(canvas, bitmap, view);
    }
  }, [bitmap, view]);

  // React registers wheel listeners as passive, and a passive listener can't
  // stop the page from scrolling while the wheel zooms the photo.
  useEffect(() => {
    const area = areaRef.current;
    if (!area) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      updateView((v) => ({ ...v, zoom: v.zoom * Math.exp(-event.deltaY * 0.0015) }));
    };
    area.addEventListener("wheel", onWheel, { passive: false });
    return () => area.removeEventListener("wheel", onWheel);
  }, [updateView]);

  function endDrag() {
    drag.current = null;
    setDragging(false);
  }

  function exportPhoto() {
    if (!bitmap) return;
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT;
    canvas.height = OUTPUT;
    draw(canvas, bitmap, view);
    canvas.toBlob((blob) => blob && onConfirm(blob), "image/jpeg", 0.92);
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-start gap-3">
        <span style={{ ...adminTypography.label, color: "#a24b3f" }}>{loadError}</span>
        <button type="button" onClick={onCancel} className="uppercase" style={adminTypography.buttonSecondary}>
          Back
        </button>
      </div>
    );
  }

  const dpr = typeof window === "undefined" ? 1 : Math.min(window.devicePixelRatio || 1, 3);
  const previewSize = aboutLayout.faceSize;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end gap-8">
        <div className="flex flex-col gap-1.5">
          <div
            ref={areaRef}
            className="relative overflow-hidden"
            style={{
              width: VIEWPORT,
              height: VIEWPORT,
              borderRadius: "3px",
              backgroundColor: adminColors.paperElevated,
              cursor: dragging ? "grabbing" : "grab",
              touchAction: "none",
            }}
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              drag.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
              setDragging(true);
            }}
            onPointerMove={(event) => {
              const start = drag.current;
              if (!start || start.pointerId !== event.pointerId) return;
              const dx = (event.clientX - start.x) / VIEWPORT;
              const dy = (event.clientY - start.y) / VIEWPORT;
              drag.current = { ...start, x: event.clientX, y: event.clientY };
              updateView((v) => ({ ...v, x: v.x + dx, y: v.y + dy }));
            }}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            <canvas
              ref={workCanvas}
              width={VIEWPORT * dpr}
              height={VIEWPORT * dpr}
              style={{ width: VIEWPORT, height: VIEWPORT, display: "block" }}
            />
            {/* Everything outside the circle is veiled: it is cropped away on
                the landing. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-full"
              style={{
                boxShadow: `0 0 0 ${VIEWPORT}px rgba(244, 239, 230, 0.78)`,
                outline: `1px dashed ${adminColors.textPrimary}`,
              }}
            />
          </div>
          <span style={adminTypography.label}>Drag to move · scroll or use the slider to zoom</span>
        </div>

        <div className="flex flex-col items-center gap-1.5">
          {/* Same frame as the back of the flip circle on the landing. */}
          <div
            className="overflow-hidden rounded-full"
            style={{
              width: previewSize,
              height: previewSize,
              border: `3px solid ${adminColors.textPrimary}`,
              backgroundColor: adminColors.paperElevated,
            }}
          >
            <canvas
              ref={previewCanvas}
              width={previewSize * dpr}
              height={previewSize * dpr}
              style={{ width: "100%", height: "100%", display: "block" }}
            />
          </div>
          <span className="uppercase" style={adminTypography.label}>
            On the landing
          </span>
        </div>
      </div>

      <label className="flex items-center gap-3" style={{ width: VIEWPORT }}>
        <span className="uppercase" style={adminTypography.label}>
          Zoom
        </span>
        <input
          type="range"
          min={1}
          max={MAX_ZOOM}
          step={0.01}
          value={view.zoom}
          onChange={(event) => {
            const zoom = Number(event.target.value);
            updateView((v) => ({ ...v, zoom }));
          }}
          className="flex-1"
          style={{ accentColor: adminColors.textPrimary }}
        />
      </label>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={exportPhoto}
          disabled={!bitmap || busy}
          className="uppercase"
          style={adminTypography.buttonPrimary}
        >
          {busy ? "Uploading…" : "Use this photo"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="uppercase"
          style={adminTypography.buttonSecondary}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
