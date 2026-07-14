"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { FACE_PARAMS, faceGeometry } from "../faceConfig";
import { aboutLayout } from "./theme";

const PAD = FACE_PARAMS.strokeWidth + 2;

/**
 * The About page centerpiece: the doodle face shown as a full circle for the
 * first time (everywhere else it peeks clipped from an edge), fully alive
 * with the landing face's eye-follow and idle blink. Hovering flips the
 * circle like a card to reveal the real photo; on touch devices a tap
 * toggles it. prefers-reduced-motion swaps the 3D flip for a crossfade
 * (see .about-flip rules in globals.css).
 */
export default function AboutFlipFace({
  photoAlt,
  flipLabel,
}: {
  photoAlt: string;
  flipLabel: string;
}) {
  const size = aboutLayout.faceSize;
  const R = size / 2 - PAD;

  const [flipped, setFlipped] = useState(false);
  // whether the device has a hover-capable pointer; only read inside event
  // handlers, so a ref avoids a pointless re-render on mount
  const canHover = useRef(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const eyeWrapL = useRef<SVGGElement>(null);
  const eyeWrapR = useRef<SVGGElement>(null);
  const blinkL = useRef<SVGGElement>(null);
  const blinkR = useRef<SVGGElement>(null);
  const browsRef = useRef<SVGGElement>(null);

  useEffect(() => {
    canHover.current = !window.matchMedia("(hover: none)").matches;
  }, []);

  const setBlink = (on: boolean) => {
    for (const ref of [blinkL, blinkR]) {
      ref.current?.classList.toggle("stickman-blink", on);
    }
  };

  // idle blink loop, same rhythm as the landing face
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

  const g = faceGeometry(R);
  const cx = R + PAD;
  const cy = R + PAD;
  const eyeY = cy + g.eyeDY;
  const browY = cy + g.browDY;
  const stroke = FACE_PARAMS.figureColor;

  return (
    <button
      type="button"
      aria-label={flipLabel}
      aria-pressed={flipped}
      className="about-flip block shrink-0 cursor-pointer rounded-full border-0 bg-transparent p-0 outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-dashed focus-visible:outline-offset-8 focus-visible:outline-[#262019]"
      style={{ width: size, height: size }}
      onMouseEnter={() => canHover.current && setFlipped(true)}
      onMouseLeave={() => canHover.current && setFlipped(false)}
      onClick={() => {
        // hover already drives the flip on pointer devices; click is the
        // toggle for touch and keyboard
        if (!canHover.current) setFlipped((f) => !f);
      }}
      onKeyDown={(e) => {
        if (canHover.current && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          setFlipped((f) => !f);
        }
      }}
    >
      <div className={`about-flip-inner${flipped ? " about-flip-flipped" : ""}`}>
        <div className="about-flip-side">
          <svg
            ref={svgRef}
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            aria-hidden="true"
          >
            <g
              stroke={stroke}
              strokeWidth={FACE_PARAMS.strokeWidth}
              strokeLinecap="round"
              fill="none"
            >
              <circle cx={cx} cy={cy} r={R} />
              <g ref={browsRef} strokeWidth={FACE_PARAMS.strokeWidth * FACE_PARAMS.browStrokeScale}>
                <line x1={cx - g.eyeOffsetX - g.browHalf} y1={browY} x2={cx - g.eyeOffsetX + g.browHalf} y2={browY} />
                <line x1={cx + g.eyeOffsetX - g.browHalf} y1={browY} x2={cx + g.eyeOffsetX + g.browHalf} y2={browY} />
              </g>
              {/* the About face gets the smile the clipped faces hide below
                  the page edge */}
              <path
                d={`M ${cx - R * 0.3} ${cy + R * 0.38} Q ${cx} ${cy + R * 0.56} ${cx + R * 0.3} ${cy + R * 0.38}`}
              />
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
          </svg>
        </div>
        <div className="about-flip-side about-flip-back">
          <Image
            src="/me.jpg"
            alt={photoAlt}
            fill
            sizes={`${size}px`}
            className="object-cover"
          />
        </div>
      </div>
    </button>
  );
}
