//See design/prototypes/landing-face.prototype.html vor visual reference for these parameters. 

export const FACE_PARAMS = {
  headRadius: 115,
  visibleFrac: 0.59, // fraction of the head's diameter visible above the bottom edge
  strokeWidth: 3,
  eyeScale: 0.11, // eye dot radius, as a fraction of head radius
  eyeOffsetScale: 0.37, // eye distance from head center, as a fraction of head radius
  browScale: 0.5, // eyebrow width, as a fraction of head radius
  browStrokeScale: 1.6, // eyebrow stroke thickness, as a multiple of the base stroke width
  travelScale: 0.08, // max eye excursion toward the cursor, as a fraction of head radius
  followEase: 0.16, // per-frame lerp factor: higher = snappier
  browFollow: 0.3, // brows drift with the eyes at this multiplier (0 = static)
  blinkMinGap: 2,
  blinkMaxGap: 6,
  blinkDuration: 100,
  figureColor: "#262019",
} as const;

/**
 * Face features derived from the head radius, so the landing face and the
 * footer face render the same features at any size. Offsets (eyeDY, browDY)
 * are relative to the head center.
 */
export function faceGeometry(headRadius: number) {
  const eyeDY = -headRadius * 0.05;
  return {
    eyeOffsetX: headRadius * FACE_PARAMS.eyeOffsetScale,
    eyeR: Math.max(1.2, headRadius * FACE_PARAMS.eyeScale),
    eyeDY,
    browDY: eyeDY - headRadius * 0.34,
    browHalf: (headRadius * FACE_PARAMS.browScale) / 2,
  };
}
