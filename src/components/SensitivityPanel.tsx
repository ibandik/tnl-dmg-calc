import { useMemo, useState, useDeferredValue } from "react";
import { Build, Enemy } from "../types";
import { analyzeSensitivity, SensitivityConfig } from "../lib/sensitivity";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { formatCompact } from "../lib/utils";
import { Star } from "lucide-react";

interface Props {
  currentBuild: Build | null;
  enemy: Enemy;
  combatType: "melee" | "ranged" | "magic";
  speedLimiter: "cooldown" | "castTime";
  skillConfig: {
    skillPotency: number;
    skillFlatAdd: number;
    hitsPerCast: number;
    weakenSkillPotency: number;
    weakenSkillFlatAdd: number;
    cooldownTime: number;
    castTime: number;
    skillCooldownSpecialization: number;
    monsterDamageBonus?: number;
  };
}

export function SensitivityPanel({
  currentBuild,
  enemy,
  combatType,
  speedLimiter,
  skillConfig,
}: Props) {
  const [ratingDelta, setRatingDelta] = useState(50);
  const [percentDelta, setPercentDelta] = useState(1);
  const [weaponDelta, setWeaponDelta] = useState(5);

  const dBuild = useDeferredValue(currentBuild);
  const dEnemy = useDeferredValue(enemy);

  const rows = useMemo(() => {
    if (!dBuild) return [];
    const cfg: SensitivityConfig = {
      ratingDelta,
      percentDelta,
      weaponDelta,
      combatType,
      attackDirection: "back",
      cooldownTime: skillConfig.cooldownTime,
      castTime: skillConfig.castTime,
      skillPotency: skillConfig.skillPotency,
      skillFlatAdd: skillConfig.skillFlatAdd,
      hitsPerCast: skillConfig.hitsPerCast,
      weakenSkillPotency: skillConfig.weakenSkillPotency,
      weakenSkillFlatAdd: skillConfig.weakenSkillFlatAdd,
      skillCooldownSpecialization: skillConfig.skillCooldownSpecialization,
      speedLimiter,
      monsterDamageBonus: skillConfig.monsterDamageBonus || 0,
      isPVP: false,
    };
    return analyzeSensitivity(dBuild, dEnemy, cfg);
  }, [dBuild, dEnemy, ratingDelta, percentDelta, weaponDelta, combatType, speedLimiter, skillConfig]);

  if (!currentBuild) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="h-4 w-4" /> Upgrade Sensitivity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Click the ⭐ icon on a build tab to mark it as your "Current" build,
            and this panel will rank which stat upgrade gives the biggest DPS gain.
          </p>
        </CardContent>
      </Card>
    );
  }

  const baselineDPS = rows[0]?.baselineDPS ?? 0;
  const top = rows.slice(0, 16);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" /> Upgrade Sensitivity
          </span>
          <span className="text-sm font-normal text-muted-foreground">
            Current build DPS: <b className="text-foreground">{formatCompact(baselineDPS)}</b>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label htmlFor="ratingDelta" className="text-xs">+Δ rating stats</Label>
            <Input id="ratingDelta" type="number" value={ratingDelta}
              onChange={(e) => setRatingDelta(parseFloat(e.target.value) || 0)}
              className="h-8 text-xs" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="percentDelta" className="text-xs">+Δ percent stats</Label>
            <Input id="percentDelta" type="number" value={percentDelta}
              onChange={(e) => setPercentDelta(parseFloat(e.target.value) || 0)}
              className="h-8 text-xs" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="weaponDelta" className="text-xs">+Δ weapon DMG</Label>
            <Input id="weaponDelta" type="number" value={weaponDelta}
              onChange={(e) => setWeaponDelta(parseFloat(e.target.value) || 0)}
              className="h-8 text-xs" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-muted-foreground">
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-2">#</th>
                <th className="text-left py-2 pr-2">Stat</th>
                <th className="text-right py-2 pr-2">Current</th>
                <th className="text-right py-2 pr-2">+Δ</th>
                <th className="text-right py-2 pr-2">New DPS</th>
                <th className="text-right py-2 pr-2">+DPS</th>
                <th className="text-right py-2">% Gain</th>
              </tr>
            </thead>
            <tbody>
              {top.map((row, i) => (
                <tr key={row.key} className="border-b border-border/40 hover:bg-muted/50">
                  <td className="py-1.5 pr-2 text-muted-foreground">{i + 1}</td>
                  <td className="py-1.5 pr-2">
                    <span className="font-medium">{row.label}</span>
                    <span className="text-muted-foreground ml-2">{row.category}</span>
                  </td>
                  <td className="py-1.5 pr-2 text-right">{formatCompact(row.current)}</td>
                  <td className="py-1.5 pr-2 text-right">{row.delta}</td>
                  <td className="py-1.5 pr-2 text-right">{formatCompact(row.newDPS)}</td>
                  <td className="py-1.5 pr-2 text-right">+{formatCompact(row.absGain)}</td>
                  <td className={"py-1.5 text-right font-semibold " + (row.pctGain > 0.5 ? "text-green-500" : row.pctGain > 0.1 ? "text-yellow-500" : "text-muted-foreground")}>
                    {row.pctGain >= 0 ? "+" : ""}{row.pctGain.toFixed(2)}%
                  </td>
                </tr>
              ))}
              {top.length === 0 && (
                <tr><td colSpan={7} className="py-4 text-center text-muted-foreground">
                  No baseline DPS — make sure the build has weapon damage and a positive cast/cooldown time.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground">
          Each row shows the DPS impact of adding the given delta to that stat (all others held constant).
          Larger % gain = better next upgrade. Compare across stats with the same delta type — different
          delta types (rating vs percent) aren't directly comparable.
        </p>
      </CardContent>
    </Card>
  );
}
