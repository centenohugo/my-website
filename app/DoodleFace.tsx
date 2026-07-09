"use client";

import { useEffect, useRef } from "react";
import { FACE_PARAMS, faceGeometry } from "./faceConfig";

// Footer face: same features as the landing face (see faceGeometry), but
// small. Like the landing face it is only partially shown: the svg is just
// tall enough for the visible slice and clips the rest, so the head peeks up
// from the bottom of the page. The eye dots follow the cursor (skipped on
// touch-only devices) and a blink fires on hover.
const HEAD_RADIUS = 26;
const STROKE_WIDTH = 1;
const PAD = 3;

export default function DoodleFace() {
  const svgRef = useRef<SVGSVGElement>(null);
  const eyeWrapL = useRef<SVGGElement>(null);
  const eyeWrapR = useRef<SVGGElement>(null);
  const blinkL = useRef<SVGGElement>(null);
  const blinkR = useRef<SVGGElement>(null);
  const browsRef = useRef<SVGGElement>(null);
  const blinkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const g = faceGeometry(HEAD_RADIUS);
  const width = HEAD_RADIUS * 2 + PAD * 2;
  const height = Math.round(HEAD_RADIUS * 2 * FACE_PARAMS.visibleFrac) + PAD;
  const cx = HEAD_RADIUS + PAD;
  const cy = HEAD_RADIUS + PAD;
  const eyeY = cy + g.eyeDY;
  const browY = cy + g.browDY;

  const setBlink = (on: boolean) => {
    for (const ref of [blinkL, blinkR]) {
      ref.current?.classList.toggle("stickman-blink", on);
    }
  };

  // cursor follow: lerp the eye dots (and, attenuated, the brows) toward the
  // cursor every frame. Skipped entirely on touch-only devices.
  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return;

    const maxTravel = HEAD_RADIUS * FACE_PARAMS.travelScale;

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
      const mag = Math.min(1, dist / (HEAD_RADIUS * 1.5)) * maxTravel;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const triggerBlink = () => {
    if (blinkTimer.current) return;
    setBlink(true);
    blinkTimer.current = setTimeout(() => {
      setBlink(false);
      blinkTimer.current = null;
    }, FACE_PARAMS.blinkDuration);
  };

  const stroke = FACE_PARAMS.figureColor;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      aria-hidden="true"
      onMouseEnter={triggerBlink}
    >
      <g stroke={stroke} strokeWidth={STROKE_WIDTH} strokeLinecap="round">
        <circle cx={cx} cy={cy} r={HEAD_RADIUS} fill="none" />
        <g ref={browsRef}>
          <line
            x1={cx - g.eyeOffsetX - g.browHalf}
            y1={browY}
            x2={cx - g.eyeOffsetX + g.browHalf}
            y2={browY}
          />
          <line
            x1={cx + g.eyeOffsetX - g.browHalf}
            y1={browY}
            x2={cx + g.eyeOffsetX + g.browHalf}
            y2={browY}
          />
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
          <circle cx={cx - g.eyeOffsetX} cy={eyeY} r={g.eyeR} fill={stroke} stroke="none" />
        </g>
      </g>
      <g ref={eyeWrapR}>
        <g
          ref={blinkR}
          className="stickman-eyes"
          style={{ transformBox: "fill-box", transformOrigin: "center" } as React.CSSProperties}
        >
          <circle cx={cx + g.eyeOffsetX} cy={eyeY} r={g.eyeR} fill={stroke} stroke="none" />
        </g>
      </g>
    </svg>
  );
}
