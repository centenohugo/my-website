"use client";

import { useEffect, useRef, useState } from "react";
import { FACE_PARAMS, faceGeometry } from "./faceConfig";

const PAD = FACE_PARAMS.strokeWidth + 2;

/**
 * The giant head peeking up from the bottom edge of the landing page.
 * The eye dots drift toward the cursor anywhere on the page; hovering the
 * head blinks immediately (same guard as the footer face used to have) and
 * random idle blinks keep running. On touch-only devices the eyes stay
 * centered and only the idle blink remains.
 */
export default function LandingFace() {
  // null until mounted: the server render uses the full configured radius,
  // then the first client measure clamps it so the head never outgrows a
  // small screen.
  const [viewportW, setViewportW] = useState<number | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const eyeWrapL = useRef<SVGGElement>(null);
  const eyeWrapR = useRef<SVGGElement>(null);
  const blinkL = useRef<SVGGElement>(null);
  const blinkR = useRef<SVGGElement>(null);
  const browsRef = useRef<SVGGElement>(null);
  const hoverBlinkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const R =
    viewportW === null
      ? FACE_PARAMS.headRadius
      : Math.min(FACE_PARAMS.headRadius, viewportW * 0.4);

  useEffect(() => {
    const onResize = () => setViewportW(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const setBlink = (on: boolean) => {
    for (const ref of [blinkL, blinkR]) {
      ref.current?.classList.toggle("stickman-blink", on);
    }
  };

  // idle blink loop, same rhythm logic as the old stickman
  useEffect(() => {
    let gapTimer: ReturnType<typeof setTimeout>;
    let closeTimer: ReturnType<typeof setTimeout>;
    const scheduleBlink = () => {
      const gap =
        (FACE_PARAMS.blinkMinGap +
          Math.random() * (FACE_PARAMS.blinkMaxGap - FACE_PARAMS.blinkMinGap)) *
        1000;
      gapTimer = setTimeout(() => {
        setBlink(true);
        closeTimer = setTimeout(() => {
          setBlink(false);
          scheduleBlink();
        }, FACE_PARAMS.blinkDuration);
      }, gap);
    };
    scheduleBlink();
    return () => {
      clearTimeout(gapTimer);
      clearTimeout(closeTimer);
    };
  }, []);

  // cursor follow: lerp the eye dots (and, attenuated, the brows) toward the
  // cursor every frame. Skipped entirely on touch-only devices.
  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return;

    const g = faceGeometry(R);
    const cx = R + PAD;
    const eyeY = PAD + R + g.eyeDY;
    const maxTravel = R * FACE_PARAMS.travelScale;

    let mouse: { x: number; y: number } | null = null;
    const cur = { lx: 0, ly: 0, rx: 0, ry: 0 };
    let raf = 0;

    const targetOffset = (rect: DOMRect, restX: number, restY: number) => {
      if (!mouse) return { x: 0, y: 0 };
      const dx = mouse.x - (rect.left + restX);
      const dy = mouse.y - (rect.top + restY);
      const dist = Math.hypot(dx, dy);
      if (dist < 1) return { x: 0, y: 0 };
      // ease in: a cursor near the eye pulls less than a faraway one
      const mag = Math.min(1, dist / (R * 1.5)) * maxTravel;
      return { x: (dx / dist) * mag, y: (dy / dist) * mag };
    };

    const tick = () => {
      const svg = svgRef.current;
      if (svg) {
        const rect = svg.getBoundingClientRect();
        const tl = targetOffset(rect, cx - g.eyeOffsetX, eyeY);
        const tr = targetOffset(rect, cx + g.eyeOffsetX, eyeY);
        cur.lx += (tl.x - cur.lx) * FACE_PARAMS.followEase;
        cur.ly += (tl.y - cur.ly) * FACE_PARAMS.followEase;
        cur.rx += (tr.x - cur.rx) * FACE_PARAMS.followEase;
        cur.ry += (tr.y - cur.ry) * FACE_PARAMS.followEase;
        eyeWrapL.current?.setAttribute("transform", `translate(${cur.lx} ${cur.ly})`);
        eyeWrapR.current?.setAttribute("transform", `translate(${cur.rx} ${cur.ry})`);
        const bx = ((cur.lx + cur.rx) / 2) * FACE_PARAMS.browFollow;
        const by = ((cur.ly + cur.ry) / 2) * FACE_PARAMS.browFollow;
        browsRef.current?.setAttribute("transform", `translate(${bx} ${by})`);
      }
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      mouse = { x: e.clientX, y: e.clientY };
    };

    document.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(tick);
    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [R]);

  const triggerHoverBlink = () => {
    if (hoverBlinkTimer.current) return;
    setBlink(true);
    hoverBlinkTimer.current = setTimeout(() => {
      setBlink(false);
      hoverBlinkTimer.current = null;
    }, FACE_PARAMS.blinkDuration);
  };

  const g = faceGeometry(R);
  const width = R * 2 + PAD * 2;
  // the head is cut off by the bottom edge: the svg is only as tall as the
  // visible slice, and clips the rest (no overflow-visible here)
  const height = Math.round(R * 2 * FACE_PARAMS.visibleFrac) + PAD;
  const cx = R + PAD;
  const cy = PAD + R;
  const eyeY = cy + g.eyeDY;
  const browY = cy + g.browDY;
  const stroke = FACE_PARAMS.figureColor;

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
    >
      <g stroke={stroke} strokeWidth={FACE_PARAMS.strokeWidth} strokeLinecap="round" fill="none">
        <circle cx={cx} cy={cy} r={R} />
        <g ref={browsRef}>
          <line x1={cx - g.eyeOffsetX - g.browHalf} y1={browY} x2={cx - g.eyeOffsetX + g.browHalf} y2={browY} />
          <line x1={cx + g.eyeOffsetX - g.browHalf} y1={browY} x2={cx + g.eyeOffsetX + g.browHalf} y2={browY} />
        </g>
      </g>
      {/* blink squashes each dot on its own center; the cursor-follow
          translate lives on the parent group, so the two never fight */}
      <g ref={eyeWrapL}>
        <g
          ref={blinkL}
          className="stickman-eyes"
          style={{ transformBox: "fill-box", transformOrigin: "center" } as React.CSSProperties}
        >
          <circle cx={cx - g.eyeOffsetX} cy={eyeY} r={g.eyeR} fill={stroke} />
        </g>
      </g>
      <g ref={eyeWrapR}>
        <g
          ref={blinkR}
          className="stickman-eyes"
          style={{ transformBox: "fill-box", transformOrigin: "center" } as React.CSSProperties}
        >
          <circle cx={cx + g.eyeOffsetX} cy={eyeY} r={g.eyeR} fill={stroke} />
        </g>
      </g>
      {/* invisible hit area so hovering "the head" works even though the
          head circle itself has no fill */}
      <circle cx={cx} cy={cy} r={R} fill="transparent" onMouseEnter={triggerHoverBlink} />
    </svg>
  );
}
