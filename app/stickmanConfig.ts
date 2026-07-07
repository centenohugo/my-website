// Tuned in design/prototypes/stickman-doodle.prototype.html — see that file
// (and delete it once no further tweaking is needed).

export const STICKMAN_PARAMS = {
  strokeWidth: 1,
  headRadius: 26,
  torsoLength: 80,
  legLength: 70,
  legSpread: 24,
  armLength: 50,
  armSpread: 45,
  eyebrowWidth: 14,
  breatheAmp: 3.5,
  breathePeriod: 2.2,
  blinkMinGap: 1,
  blinkMaxGap: 4.5,
  blinkDuration: 100,
  figureColor: "#262019",
} as const;

export const LEAN_MIN_DEG = 4;
export const LEAN_MAX_DEG = 16;
export const LEAN_TRANSITION_MS = 260;

/** Always leans toward the nav column (negative); magnitude grows for lower items. */
export function leanAngleForIndex(index: number, count: number): number {
  const t = count > 1 ? index / (count - 1) : 0;
  const magnitude = LEAN_MIN_DEG + (LEAN_MAX_DEG - LEAN_MIN_DEG) * t;
  return -magnitude;
}
