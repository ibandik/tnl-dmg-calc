import { memo, useCallback } from "react";
import { Build } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { X, Info } from "lucide-react";
import { Section } from "./ui/section";

interface BuildFormProps {
  build: Build;
  onChange: (build: Build) => void;
  onPropertyChange?: <K extends keyof Build>(key: K, value: Build[K]) => void;
  onRemove?: () => void;
  speedLimiter?: "cooldown" | "castTime";
  onSpeedLimiterChange?: (value: "cooldown" | "castTime") => void;
  combatType: "melee" | "ranged" | "magic";
  isPvP: boolean;
}

const TYPE_LABEL: Record<"melee" | "ranged" | "magic", string> = {
  melee: "Melee",
  ranged: "Ranged",
  magic: "Magic",
};

export const BuildForm = memo(function BuildForm({
  build,
  onChange,
  onPropertyChange,
  onRemove,
  speedLimiter = "cooldown",
  onSpeedLimiterChange,
  combatType,
  isPvP,
}: BuildFormProps) {
  const handleInputChange = useCallback(
    (field: keyof Build, value: string) => {
      if (value === "" || value === "-") {
        if (onPropertyChange) {
          onPropertyChange(field, undefined as any);
        } else {
          onChange({ ...build, [field]: undefined as any });
        }
        return;
      }
      const numValue = parseFloat(value);
      if (Number.isNaN(numValue)) return;
      if (onPropertyChange) {
        onPropertyChange(field, numValue);
      } else {
        onChange({ ...build, [field]: numValue });
      }
    },
    [build, onChange, onPropertyChange]
  );

  const handleNameChange = useCallback(
    (value: string) => {
      if (onPropertyChange) {
        onPropertyChange("name", value);
      } else {
        onChange({ ...build, name: value });
      }
    },
    [build, onChange, onPropertyChange]
  );

  const Field = ({
    field,
    label,
    placeholder,
    step,
    info,
  }: {
    field: keyof Build;
    label: string;
    placeholder?: string;
    step?: string;
    info?: React.ReactNode;
  }) => (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        <Label htmlFor={field as string} className="text-xs">
          {label}
        </Label>
        {info && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3 w-3 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>{info}</TooltipContent>
          </Tooltip>
        )}
      </div>
      <Input
        id={field as string}
        type="number"
        step={step}
        value={(build[field] as number | undefined) ?? ""}
        onChange={(e) => handleInputChange(field, e.target.value)}
        className="h-8 text-xs"
        placeholder={placeholder}
      />
    </div>
  );

  // Resolve combat-type-specific stat keys (so the form shows only the selected type)
  const critKey = (`${combatType}Critical` as keyof Build);
  const hitKey = (`${combatType}Hit` as keyof Build);
  const heavyKey = (`${combatType}HeavyAttack` as keyof Build);
  const bossCritKey = (`boss${combatType[0].toUpperCase()}${combatType.slice(1)}Critical` as keyof Build);
  const bossHitKey = (`boss${combatType[0].toUpperCase()}${combatType.slice(1)}Hit` as keyof Build);
  const bossHeavyKey = (`boss${combatType[0].toUpperCase()}${combatType.slice(1)}HeavyAttack` as keyof Build);
  const typeName = TYPE_LABEL[combatType];

  return (
    <TooltipProvider>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="flex-1">
            <Input
              type="text"
              value={build.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Build Name"
              className="font-semibold bg-transparent px-2 text-base h-9 focus:ring-0"
            />
          </CardTitle>
          {onRemove && (
            <Button
              onClick={onRemove}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          <Section title="Weapon Damage" defaultOpen>
            <div className="grid grid-cols-2 gap-3">
              <Field field="minDMG" label="Min DMG" />
              <Field field="maxDMG" label="Max DMG" />
              <Field field="bonusDamage" label="Bonus Damage" />
              <Field field="offhandChance" label="Offhand Chance" step="0.01" placeholder="0.50" />
              <Field field="offhandMinDMG" label="Offhand Min" />
              <Field field="offhandMaxDMG" label="Offhand Max" />
            </div>
          </Section>

          <Section title={`${typeName} — Critical & Crit Damage`} defaultOpen>
            <div className="grid grid-cols-2 gap-3">
              <Field field={critKey} label={`${typeName} Critical`} />
              <Field field="criticalDamage" label="Critical Damage %" placeholder="50" />
            </div>
          </Section>

          <Section title={`${typeName} — Heavy Attack`} defaultOpen>
            <div className="grid grid-cols-2 gap-3">
              <Field field={heavyKey} label={`${typeName} Heavy`} />
              <Field
                field="heavyAttackDamage"
                label="Heavy Atk Dmg %"
                placeholder="0"
                info={
                  <p className="max-w-xs">
                    Bonus is additive to the +100% portion only.
                    <br />+30% HA Dmg → ×2.30 on a heavy hit, not ×2.60.
                  </p>
                }
              />
            </div>
          </Section>

          <Section title={`${typeName} — Hit`} defaultOpen>
            <div className="grid grid-cols-1 gap-3">
              <Field field={hitKey} label={`${typeName} Hit`} />
            </div>
          </Section>

          <Section title="Skill & Weaken">
            <div className="grid grid-cols-2 gap-3">
              <Field field="skillDamageBoost" label="Skill Damage Boost" />
              <Field field="weakenChance" label="Weaken Chance" />
            </div>
          </Section>

          <Section title="Speed & Cooldown">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field
                  field="attackSpeedTime"
                  label="Attack Speed (s)"
                  step="0.01"
                  placeholder="0.36"
                  info={
                    <p className="max-w-xs">
                      Time between auto attacks. Mostly affects auto-attack and
                      cast animations — for skill DPS, focus on Cooldown Speed.
                    </p>
                  }
                />
                <Field field="cooldownSpeed" label="Cooldown Speed" step="0.1" placeholder="40.9" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">CDR % (computed)</Label>
                <Input
                  type="text"
                  value={
                    build.cooldownSpeed
                      ? ((build.cooldownSpeed / (build.cooldownSpeed + 100)) * 100).toFixed(1) + "%"
                      : "—"
                  }
                  className="h-8 text-xs bg-muted/40"
                  readOnly
                />
              </div>
              {onSpeedLimiterChange && (
                <div className="rounded-md bg-muted/40 p-2 space-y-1">
                  <Label className="text-xs text-muted-foreground">DPS calc mode</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="cooldown-limited"
                        checked={speedLimiter === "cooldown"}
                        onCheckedChange={(c) => c && onSpeedLimiterChange("cooldown")}
                      />
                      <Label htmlFor="cooldown-limited" className="text-xs cursor-pointer">
                        Cooldown (skills)
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="cast-time-limited"
                        checked={speedLimiter === "castTime"}
                        onCheckedChange={(c) => c && onSpeedLimiterChange("castTime")}
                      />
                      <Label htmlFor="cast-time-limited" className="text-xs cursor-pointer">
                        Cast time (spam)
                      </Label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Section>

          {!isPvP && (
            <Section title={`${typeName} — Boss Bonuses`}>
              <div className="grid grid-cols-3 gap-3">
                <Field field={bossCritKey} label="Boss Crit" />
                <Field field={bossHitKey} label="Boss Hit" />
                <Field field={bossHeavyKey} label="Boss Heavy" />
              </div>
            </Section>
          )}

          <Section title="PvE Bonuses">
            <div className="grid grid-cols-2 gap-3">
              <Field field="speciesDamageBoost" label="Species Damage Boost" />
              <Field field="pveDamageMultiplier" label="PvE Damage %" />
            </div>
          </Section>

          <Section title="Positional (back attack assumed)">
            <div className="grid grid-cols-3 gap-3">
              <Field field="backCriticalHit" label="Back Crit" />
              <Field field="backHitChance" label="Back Hit" />
              <Field field="backHeavyAttackChance" label="Back Heavy" />
              <Field field="sideCriticalHit" label="Side Crit" />
              <Field field="sideHitChance" label="Side Hit" />
              <Field field="sideHeavyAttackChance" label="Side Heavy" />
            </div>
          </Section>

          <Section title="Block">
            <div className="grid grid-cols-2 gap-3">
              <Field field="shieldBlockPenetrationChance" label="Block Penetration %" />
            </div>
          </Section>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
});
