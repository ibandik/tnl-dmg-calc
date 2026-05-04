import { Build } from "../types";

/**
 * BAC = Buff-duration · Attack-speed · CDR coefficient.
 *
 * A single per-build throughput multiplier that approximates how much more
 * damage a build outputs over a fight versus a zero-stat baseline, based on
 * three caps-at-150% stats:
 *
 *   - Attack Speed %  (build.attackSpeedPercent)
 *   - CDR %           (derived from build.cooldownSpeed via the rating curve)
 *   - Buff Duration % (build.buffDuration)
 *
 * Each contributes (1 + clamp(x, 0, 150)/100) and the three are multiplied.
 *
 * NOTE: This is a heuristic for at-a-glance comparison. It does NOT replace
 * DPS math (which already includes attack speed + CDR via cast/cooldown
 * timing). It WILL double-count if you also compute DPS from cast/cooldown.
 * Use BAC for ranking and rough scaling only.
 */

const CAP = 150; // % cap applied to each component

function clampPct(v: number): number {
  if (!isFinite(v) || v < 0) return 0;
  return Math.min(CAP, v);
}

/** CDR % from raw cooldown-speed rating using the standard rating-curve (divisor 100). */
export function cdrPercentFromRating(rating: number = 0): number {
  if (!rating || rating <= 0) return 0;
  return (rating / (rating + 100)) * 100;
}

export interface BACBreakdown {
  attackSpeedFactor: number; // 1..2.5
  cdrFactor: number;         // 1..2.5
  buffFactor: number;        // 1..2.5
  attackSpeedPct: number;    // raw, clamped
  cdrPct: number;            // raw, clamped
  buffPct: number;           // raw, clamped
  bac: number;               // product
}

export function computeBACBreakdown(build: Build): BACBreakdown {
  const aspeedPct = clampPct(build.attackSpeedPercent ?? 0);
  const cdrPct = clampPct(cdrPercentFromRating(build.cooldownSpeed));
  const buffPct = clampPct(build.buffDuration ?? 0);

  const attackSpeedFactor = 1 + aspeedPct / 100;
  const cdrFactor = 1 + cdrPct / 100;
  const buffFactor = 1 + buffPct / 100;

  return {
    attackSpeedFactor,
    cdrFactor,
    buffFactor,
    attackSpeedPct: aspeedPct,
    cdrPct,
    buffPct,
    bac: attackSpeedFactor * cdrFactor * buffFactor,
  };
}

export function computeBAC(build: Build): number {
  return computeBACBreakdown(build).bac;
}
