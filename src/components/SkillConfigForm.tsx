import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Info } from "lucide-react";
import { Section } from "./ui/section";

interface SkillConfig {
  skillPotency: number;
  skillFlatAdd: number;
  hitsPerCast: number;
  weakenSkillPotency: number;
  weakenSkillFlatAdd: number;
  cooldownTime: number;
  castTime: number;
  skillCooldownSpecialization: number;
  monsterDamageBonus?: number;
}

interface SkillConfigFormProps {
  config: SkillConfig;
  onChange: (config: SkillConfig) => void;
}

export function SkillConfigForm({ config, onChange }: SkillConfigFormProps) {
  function handleInputChange(field: keyof SkillConfig, value: string) {
    if (value === "" || value === "-") {
      onChange({ ...config, [field]: undefined as any });
      return;
    }
    const numValue = parseFloat(value);
    if (Number.isNaN(numValue)) return;
    onChange({ ...config, [field]: numValue });
  }

  const Field = ({
    id,
    label,
    value,
    placeholder,
    step,
    info,
  }: {
    id: keyof SkillConfig;
    label: string;
    value: number | undefined;
    placeholder?: string;
    step?: string;
    info?: React.ReactNode;
  }) => (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        <Label htmlFor={id as string} className="text-xs">
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
        id={id as string}
        type="number"
        step={step}
        value={value ?? ""}
        onChange={(e) => handleInputChange(id, e.target.value)}
        className="h-8 text-xs"
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <TooltipProvider>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Skill</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <Field
              id="skillPotency"
              label="Potency"
              value={config.skillPotency}
              step="0.1"
              placeholder="1.0"
              info={
                <p className="max-w-xs">
                  Decimal multiplier of base damage.
                  <br />120% = 1.2 · 250% = 2.5
                </p>
              }
            />
            <Field
              id="skillFlatAdd"
              label="Flat Add"
              value={config.skillFlatAdd}
              placeholder="0"
              info={<p className="max-w-xs">Flat damage added after potency.</p>}
            />
            <Field
              id="hitsPerCast"
              label="Hits / Cast"
              value={config.hitsPerCast}
              placeholder="1"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field
              id="cooldownTime"
              label="Cooldown (s)"
              value={config.cooldownTime}
              step="0.1"
              placeholder="10"
            />
            <Field
              id="castTime"
              label="Cast (s)"
              value={config.castTime}
              step="0.1"
              placeholder="1"
            />
            <Field
              id="monsterDamageBonus"
              label="+% to Monsters"
              value={config.monsterDamageBonus}
              step="1"
              placeholder="0"
              info={
                <p className="max-w-xs">
                  Per-skill bonus damage vs monsters (PvE only).
                  <br />"+60% to monsters" → enter <b>60</b>.
                </p>
              }
            />
          </div>

          <Section title="Advanced">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field
                  id="weakenSkillPotency"
                  label="Weaken Potency Bonus"
                  value={config.weakenSkillPotency}
                  step="0.1"
                  placeholder="0"
                  info={
                    <p className="max-w-xs">
                      Extra potency added when target is weakened.
                    </p>
                  }
                />
                <Field
                  id="weakenSkillFlatAdd"
                  label="Weaken Flat Bonus"
                  value={config.weakenSkillFlatAdd}
                  placeholder="0"
                />
              </div>
              <div className="grid grid-cols-1 gap-3">
                <Field
                  id="skillCooldownSpecialization"
                  label="CD Specialization (s)"
                  value={config.skillCooldownSpecialization}
                  step="0.1"
                  placeholder="0"
                />
              </div>
            </div>
          </Section>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
