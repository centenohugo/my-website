"use client";

import { useRef } from "react";
import { STICKMAN_PARAMS } from "./stickmanConfig";

const PAD = 3;

export default function DoodleFace() {
  const eyesRef = useRef<SVGGElement>(null);
  const blinkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { headRadius, eyebrowWidth, strokeWidth, figureColor, blinkDuration } = STICKMAN_PARAMS;
  const size = headRadius * 2 + PAD * 2;
  const cx = headRadius + PAD;
  const cy = headRadius + PAD;
  const eyeOffsetX = headRadius * 0.38;
  const eyeY = cy - headRadius * 0.05;
  const eyeR = Math.max(1.2, headRadius * 0.11);
  const browY = eyeY - headRadius * 0.34;
  const browHalf = eyebrowWidth / 2;

  const triggerBlink = () => {
    if (blinkTimer.current) return;
    eyesRef.current?.classList.add("stickman-blink");
    blinkTimer.current = setTimeout(() => {
      eyesRef.current?.classList.remove("stickman-blink");
      blinkTimer.current = null;
    }, blinkDuration);
  };

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      aria-hidden="true"
      onMouseEnter={triggerBlink}
    >
      <g stroke={figureColor} strokeWidth={strokeWidth} strokeLinecap="round">
        <circle cx={cx} cy={cy} r={headRadius} fill="none" />
        <line
          x1={cx - eyeOffsetX - browHalf}
          y1={browY}
          x2={cx - eyeOffsetX + browHalf}
          y2={browY}
        />
        <line
          x1={cx + eyeOffsetX - browHalf}
          y1={browY}
          x2={cx + eyeOffsetX + browHalf}
          y2={browY}
        />
        <g
          ref={eyesRef}
          className="stickman-eyes"
          style={{ transformBox: "fill-box", transformOrigin: "center" } as React.CSSProperties}
        >
          <circle cx={cx - eyeOffsetX} cy={eyeY} r={eyeR} fill={figureColor} stroke="none" />
          <circle cx={cx + eyeOffsetX} cy={eyeY} r={eyeR} fill={figureColor} stroke="none" />
        </g>
      </g>
    </svg>
  );
}
