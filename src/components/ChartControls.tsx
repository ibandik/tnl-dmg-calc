import React from "react";
import { StatKey } from "../types";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "./ui/select";

interface ChartControlsProps {
  xAxisStat: StatKey;
  onXAxisChange: (stat: StatKey) => void;
  xAxisRange: { min: number; max: number; step: number };
  onXAxisRangeChange: (range: { min: number; max: number; step: number }) => void;
  yMetric:
    | "expectedDamage"
    | "finalDamage"
    | "critChance"
    | "hitChance"
    | "dps";
  onYMetricChange: (
    metric: "expectedDamage" | "finalDamage" | "critChance" | "hitChance" | "dps"
  ) => void;
  // combatType is set via the header pill; kept here for backward compat
  combatType: "melee" | "ranged" | "magic";
  onCombatTypeChange: (type: "melee" | "ranged" | "magic") => void;
}

const ATTACKER_STATS: { value: StatKey; label: string }[] = [
  { value: "minDMG", label: "Min DMG" },
  { value: "maxDMG", label: "Max DMG" },
  { value: "bonusDamage", label: "Bonus Damage" },
  { value: "meleeCritical", label: "Melee Critical" },
  { value: "rangedCritical", label: "Ranged Critical" },
  { value: "magicCritical", label: "Magic Critical" },
  { value: "criticalDamage", label: "Critical Damage %" },
  { value: "meleeHit", label: "Melee Hit" },
  { value: "rangedHit", label: "Ranged Hit" },
  { value: "magicHit", label: "Magic Hit" },
  { value: "meleeHeavyAttack", label: "Melee Heavy Attack" },
  { value: "rangedHeavyAttack", label: "Ranged Heavy Attack" },
  { value: "magicHeavyAttack", label: "Magic Heavy Attack" },
  { value: "skillDamageBoost", label: "Skill Damage Boost" },
  { value: "attackSpeedTime", label: "Attack Speed (s)" },
  { value: "attackSpeedPercent", label: "Attack Speed %" },
  { value: "cooldownSpeed", label: "Cooldown Speed" },
];

const ENEMY_STATS: { value: StatKey; label: string }[] = [
  { value: "meleeEndurance", label: "Melee Endurance" },
  { value: "rangedEndurance", label: "Ranged Endurance" },
  { value: "magicEndurance", label: "Magic Endurance" },
  { value: "meleeEvasion", label: "Melee Evasion" },
  { value: "rangedEvasion", label: "Ranged Evasion" },
  { value: "magicEvasion", label: "Magic Evasion" },
  { value: "meleeHeavyAttackEvasion", label: "Melee Heavy Evasion" },
  { value: "rangedHeavyAttackEvasion", label: "Ranged Heavy Evasion" },
  { value: "magicHeavyAttackEvasion", label: "Magic Heavy Evasion" },
  { value: "meleeDefense", label: "Melee Defense" },
  { value: "rangedDefense", label: "Ranged Defense" },
  { value: "magicDefense", label: "Magic Defense" },
  { value: "skillDamageResistance", label: "Skill Damage Resistance" },
  { value: "damageReduction", label: "Damage Reduction" },
];

const Y_METRIC_OPTIONS = [
  { value: "expectedDamage" as const, label: "Expected Final Damage" },
  { value: "finalDamage" as const, label: "Single Hit Damage" },
  { value: "dps" as const, label: "DPS (Damage per Second)" },
  { value: "critChance" as const, label: "Crit Chance" },
  { value: "hitChance" as const, label: "Hit Chance" },
];

export const ChartControls: React.FC<ChartControlsProps> = ({
  xAxisStat,
  onXAxisChange,
  xAxisRange,
  onXAxisRangeChange,
  yMetric,
  onYMetricChange,
}) => {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">X-Axis</Label>
          <Select
            value={xAxisStat}
            onValueChange={(value) => onXAxisChange(value as StatKey)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Attacker</SelectLabel>
                {ATTACKER_STATS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Enemy</SelectLabel>
                {ENEMY_STATS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Y-Axis</Label>
          <Select
            value={yMetric}
            onValueChange={(value) => onYMetricChange(value as any)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Y_METRIC_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <Label htmlFor="x-min" className="text-xs text-muted-foreground">Min</Label>
          <Input
            id="x-min"
            type="number"
            className="h-8 text-xs"
            value={Number.isFinite(xAxisRange.min) ? xAxisRange.min : ""}
            onChange={(e) =>
              onXAxisRangeChange({
                ...xAxisRange,
                min: e.target.value === "" ? 0 : parseInt(e.target.value),
              })
            }
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="x-max" className="text-xs text-muted-foreground">Max</Label>
          <Input
            id="x-max"
            type="number"
            className="h-8 text-xs"
            value={Number.isFinite(xAxisRange.max) ? xAxisRange.max : ""}
            onChange={(e) =>
              onXAxisRangeChange({
                ...xAxisRange,
                max: e.target.value === "" ? 1000 : parseInt(e.target.value),
              })
            }
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="x-step" className="text-xs text-muted-foreground">Step</Label>
          <Input
            id="x-step"
            type="number"
            className="h-8 text-xs"
            value={Number.isFinite(xAxisRange.step) ? xAxisRange.step : ""}
            onChange={(e) =>
              onXAxisRangeChange({
                ...xAxisRange,
                step: e.target.value === "" ? 50 : parseInt(e.target.value),
              })
            }
          />
        </div>
      </div>
    </div>
  );
};
