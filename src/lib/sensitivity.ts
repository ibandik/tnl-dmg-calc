import { Build, Enemy } from "../types";
import { calculateDPS } from "../calculations";

export interface SensitivityRow {
  key: keyof Build;
  label: string;
  category: string;
  current: number;
  delta: number;
  baselineDPS: number;
  newDPS: number;
  absGain: number;
  pctGain: number; // (new - base) / base * 100
}

export interface SensitivityConfig {
  // Per-stat delta overrides; otherwise we use the type-based default
  deltas?: Partial<Record<keyof Build, number>>;
  ratingDelta?: number; // default for rating stats (crit/hit/heavy/skill boost/etc)
  percentDelta?: number; // default for percentage stats
  weaponDelta?: number; // default for min/max DMG
  combatType: "melee" | "ranged" | "magic";
  attackDirection: "front" | "side" | "back";
  cooldownTime: number;
  castTime: number;
  skillPotency: number;
  skillFlatAdd: number;
  hitsPerCast: number;
  weakenSkillPotency: number;
  weakenSkillFlatAdd: number;
  skillCooldownSpecialization: number;
  speedLimiter: "cooldown" | "castTime";
  monsterDamageBonus: number;
  isPVP: boolean;
}

// Stats we offer as candidate upgrades. Boss-bonus + positional are intentionally
// excluded — they don't move with normal gear.
type StatDef = {
  key: keyof Build;
  label: string;
  category: string;
  type: "rating" | "percent" | "weapon";
};

const STAT_CATALOG: StatDef[] = [
  // Weapon
  { key: "minDMG", label: "Min Weapon DMG", category: "Weapon", type: "weapon" },
  { key: "maxDMG", label: "Max Weapon DMG", category: "Weapon", type: "weapon" },
  { key: "bonusDamage", label: "Bonus Damage", category: "Weapon", type: "weapon" },
  // Critical
  { key: "meleeCritical", label: "Melee Critical", category: "Critical", type: "rating" },
  { key: "rangedCritical", label: "Ranged Critical", category: "Critical", type: "rating" },
  { key: "magicCritical", label: "Magic Critical", category: "Critical", type: "rating" },
  { key: "criticalDamage", label: "Critical Damage %", category: "Critical", type: "percent" },
  // Hit
  { key: "meleeHit", label: "Melee Hit", category: "Hit", type: "rating" },
  { key: "rangedHit", label: "Ranged Hit", category: "Hit", type: "rating" },
  { key: "magicHit", label: "Magic Hit", category: "Hit", type: "rating" },
  // Heavy
  { key: "meleeHeavyAttack", label: "Melee Heavy Attack", category: "Heavy", type: "rating" },
  { key: "rangedHeavyAttack", label: "Ranged Heavy Attack", category: "Heavy", type: "rating" },
  { key: "magicHeavyAttack", label: "Magic Heavy Attack", category: "Heavy", type: "rating" },
  { key: "heavyAttackDamage", label: "Heavy Attack Damage %", category: "Heavy", type: "percent" },
  // Skills
  { key: "skillDamageBoost", label: "Skill Damage Boost", category: "Skills", type: "rating" },
  { key: "weakenChance", label: "Weaken Chance", category: "Skills", type: "rating" },
  // Speed
  { key: "cooldownSpeed", label: "Cooldown Speed %", category: "Speed", type: "percent" },
  { key: "attackSpeedPercent", label: "Attack Speed %", category: "Speed", type: "percent" },
  // PvE
  { key: "speciesDamageBoost", label: "Species Damage Boost", category: "PvE", type: "rating" },
  { key: "pveDamageMultiplier", label: "PvE Damage %", category: "PvE", type: "percent" },
  // Boss-specific bonuses (additive vs bosses)
  { key: "bossMeleeCritical", label: "Boss Melee Crit", category: "Boss", type: "rating" },
  { key: "bossRangedCritical", label: "Boss Ranged Crit", category: "Boss", type: "rating" },
  { key: "bossMagicCritical", label: "Boss Magic Crit", category: "Boss", type: "rating" },
  { key: "bossMeleeHit", label: "Boss Melee Hit", category: "Boss", type: "rating" },
  { key: "bossRangedHit", label: "Boss Ranged Hit", category: "Boss", type: "rating" },
  { key: "bossMagicHit", label: "Boss Magic Hit", category: "Boss", type: "rating" },
  { key: "bossMeleeHeavyAttack", label: "Boss Melee Heavy", category: "Boss", type: "rating" },
  { key: "bossRangedHeavyAttack", label: "Boss Ranged Heavy", category: "Boss", type: "rating" },
  { key: "bossMagicHeavyAttack", label: "Boss Magic Heavy", category: "Boss", type: "rating" },
];

function deltaFor(stat: StatDef, cfg: SensitivityConfig): number {
  if (cfg.deltas && cfg.deltas[stat.key] !== undefined) {
    return cfg.deltas[stat.key]!;
  }
  if (stat.type === "rating") return cfg.ratingDelta ?? 50;
  if (stat.type === "percent") return cfg.percentDelta ?? 1;
  return cfg.weaponDelta ?? 5;
}

function dpsFor(build: Build, enemy: Enemy, cfg: SensitivityConfig): number {
  return calculateDPS(
    build,
    enemy,
    cfg.combatType,
    cfg.attackDirection,
    cfg.cooldownTime,
    cfg.castTime,
    cfg.isPVP,
    cfg.skillPotency,
    cfg.skillFlatAdd,
    cfg.hitsPerCast,
    cfg.weakenSkillPotency,
    cfg.weakenSkillFlatAdd,
    cfg.skillCooldownSpecialization,
    cfg.speedLimiter === "cooldown",
    cfg.speedLimiter === "castTime",
    cfg.monsterDamageBonus
  );
}

/**
 * For each candidate stat, perturb by `delta`, recompute DPS, and report
 * absolute + percentage gain. Sorted by % gain descending.
 */
export function analyzeSensitivity(
  build: Build,
  enemy: Enemy,
  cfg: SensitivityConfig
): SensitivityRow[] {
  const baseline = dpsFor(build, enemy, cfg);
  if (!isFinite(baseline) || baseline <= 0) return [];

  const rows: SensitivityRow[] = [];

  for (const stat of STAT_CATALOG) {
    const current = (build[stat.key] as number | undefined) ?? 0;
    const delta = deltaFor(stat, cfg);
    if (delta === 0) continue;

    const perturbed: Build = { ...build, [stat.key]: current + delta };
    const newDPS = dpsFor(perturbed, enemy, cfg);
    const absGain = newDPS - baseline;
    const pctGain = (absGain / baseline) * 100;

    rows.push({
      key: stat.key,
      label: stat.label,
      category: stat.category,
      current,
      delta,
      baselineDPS: baseline,
      newDPS,
      absGain,
      pctGain,
    });
  }

  // Drop rows with effectively no impact (e.g. melee crit perturbation on a magic build)
  const filtered = rows.filter((r) => Math.abs(r.absGain) > baseline * 1e-6);

  // Sort by % gain descending; ties broken by absolute gain
  filtered.sort((a, b) => b.pctGain - a.pctGain || b.absGain - a.absGain);
  return filtered;
}
