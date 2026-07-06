"use client";

import { useEffect, useRef } from "react";
import type { STICKMAN_PARAMS } from "./stickmanConfig";

type Params = typeof STICKMAN_PARAMS;

const GROUND_Y = 280;
const CENTER_X = 120;
const NECK_GAP = 3;

export default function StickmanDoodle({
  leanDeg,
  leanTransitionMs,
  params,
}: {
  leanDeg: number;
  leanTransitionMs: number;
  params: Params;
}) {
  const eyesRef = useRef<SVGGElement>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const scheduleBlink = () => {
      const gap =
        (params.blinkMinGap + Math.random() * (params.blinkMaxGap - params.blinkMinGap)) * 1000;
      timer = setTimeout(() => {
        eyesRef.current?.classList.add("stickman-blink");
        setTimeout(() => {
          eyesRef.current?.classList.remove("stickman-blink");
          scheduleBlink();
        }, params.blinkDuration);
      }, gap);
    };
    scheduleBlink();
    return () => clearTimeout(timer);
  }, [params.blinkMinGap, params.blinkMaxGap, params.blinkDuration]);

  const hipY = GROUND_Y - params.legLength;
  const neckY = hipY - params.torsoLength;
  const headCenterY = neckY - params.headRadius - NECK_GAP;
  const shoulderY = neckY + params.torsoLength * 0.12;
  const handY = shoulderY + params.armLength;
  const eyeOffsetX = params.headRadius * 0.38;
  const eyeY = headCenterY - params.headRadius * 0.05;
  const eyeR = Math.max(1.2, params.headRadius * 0.11);
  const browY = eyeY - params.headRadius * 0.34;
  const browHalf = params.eyebrowWidth / 2;
  const stroke = params.figureColor;

  return (
    <svg viewBox="0 0 240 320" className="h-full w-full overflow-visible" aria-hidden="true">
      {/* legs: planted, do not lean */}
      <g stroke={stroke} strokeWidth={params.strokeWidth} strokeLinecap="round">
        <line x1={CENTER_X} y1={hipY} x2={CENTER_X - params.legSpread} y2={GROUND_Y} />
        <line x1={CENTER_X} y1={hipY} x2={CENTER_X + params.legSpread} y2={GROUND_Y} />
      </g>

      {/* rigid torso+head unit: this whole group rotates on lean.
          Pivot is an explicit point in the SVG's own coordinate space (the
          hip), not a computed fill-box origin — fill-box has to be
          recalculated from the group's contents, and one of those contents
          (the breathing loop) is continuously animating, so its bounding
          box can be recomputed slightly differently depending on timing.
          A fixed pixel pivot is deterministic across browsers and reloads. */}
      <g
        className="stickman-lean"
        style={
          {
            transformBox: "view-box",
            transformOrigin: `${CENTER_X}px ${hipY}px`,
            transform: `rotate(${leanDeg}deg)`,
            "--stickman-lean-transition": `${leanTransitionMs}ms`,
          } as React.CSSProperties
        }
      >
        <g
          className="stickman-breathe"
          style={
            {
              "--stickman-breathe-amp": `${params.breatheAmp}px`,
              "--stickman-breathe-period": `${params.breathePeriod}s`,
            } as React.CSSProperties
          }
          stroke={stroke}
          strokeWidth={params.strokeWidth}
          strokeLinecap="round"
        >
          <line x1={CENTER_X} y1={neckY} x2={CENTER_X} y2={hipY} />
          <line x1={CENTER_X} y1={shoulderY} x2={CENTER_X - params.armSpread} y2={handY} />
          <line x1={CENTER_X} y1={shoulderY} x2={CENTER_X + params.armSpread} y2={handY} />
          <circle cx={CENTER_X} cy={headCenterY} r={params.headRadius} fill="none" />
          <line
            x1={CENTER_X - eyeOffsetX - browHalf}
            y1={browY}
            x2={CENTER_X - eyeOffsetX + browHalf}
            y2={browY}
          />
          <line
            x1={CENTER_X + eyeOffsetX - browHalf}
            y1={browY}
            x2={CENTER_X + eyeOffsetX + browHalf}
            y2={browY}
          />
          <g
            ref={eyesRef}
            className="stickman-eyes"
            style={{ transformBox: "fill-box", transformOrigin: "center" } as React.CSSProperties}
          >
            <circle cx={CENTER_X - eyeOffsetX} cy={eyeY} r={eyeR} fill={stroke} stroke="none" />
            <circle cx={CENTER_X + eyeOffsetX} cy={eyeY} r={eyeR} fill={stroke} stroke="none" />
          </g>
        </g>
      </g>
    </svg>
  );
}
