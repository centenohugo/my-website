"use client";

import { useRef } from "react";
import { FACE_PARAMS, faceGeometry } from "./faceConfig";

// Footer face: same features as the landing face (see faceGeometry), but
// small, fully visible, and static except for a blink on hover.
const HEAD_RADIUS = 26;
const STROKE_WIDTH = 1;
const PAD = 3;

export default function DoodleFace() {
  const eyesRef = useRef<SVGGElement>(null);
  const blinkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const g = faceGeometry(HEAD_RADIUS);
  const size = HEAD_RADIUS * 2 + PAD * 2;
  const cx = HEAD_RADIUS + PAD;
  const cy = HEAD_RADIUS + PAD;
  const eyeY = cy + g.eyeDY;
  const browY = cy + g.browDY;

  const triggerBlink = () => {
    if (blinkTimer.current) return;
    eyesRef.current?.classList.add("stickman-blink");
    blinkTimer.current = setTimeout(() => {
      eyesRef.current?.classList.remove("stickman-blink");
      blinkTimer.current = null;
    }, FACE_PARAMS.blinkDuration);
  };

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      aria-hidden="true"
      onMouseEnter={triggerBlink}
    >
      <g stroke={FACE_PARAMS.figureColor} strokeWidth={STROKE_WIDTH} strokeLinecap="round">
        <circle cx={cx} cy={cy} r={HEAD_RADIUS} fill="none" />
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
        <g
          ref={eyesRef}
          className="stickman-eyes"
          style={{ transformBox: "fill-box", transformOrigin: "center" } as React.CSSProperties}
        >
          <circle cx={cx - g.eyeOffsetX} cy={eyeY} r={g.eyeR} fill={FACE_PARAMS.figureColor} stroke="none" />
          <circle cx={cx + g.eyeOffsetX} cy={eyeY} r={g.eyeR} fill={FACE_PARAMS.figureColor} stroke="none" />
        </g>
      </g>
    </svg>
  );
}
