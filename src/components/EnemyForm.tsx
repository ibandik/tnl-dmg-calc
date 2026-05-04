import { memo, useCallback } from "react";
import { Enemy } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { X } from "lucide-react";
import { Section } from "./ui/section";

interface EnemyFormProps {
  enemy: Enemy;
  onChange: (enemy: Enemy) => void;
  onPropertyChange?: <K extends keyof Enemy>(key: K, value: Enemy[K]) => void;
  onRemove?: () => void;
  combatType: "melee" | "ranged" | "magic";
  isPvP: boolean;
}

const TYPE_LABEL: Record<"melee" | "ranged" | "magic", string> = {
  melee: "Melee",
  ranged: "Ranged",
  magic: "Magic",
};

export const EnemyForm = memo(function EnemyForm({
  enemy,
  onChange,
  onPropertyChange,
  onRemove,
  combatType,
  isPvP,
}: EnemyFormProps) {
  const handleInputChange = useCallback(
    (field: keyof Enemy, value: string) => {
      if (value === "" || value === "-") {
        if (onPropertyChange) {
          onPropertyChange(field, undefined as any);
        } else {
          onChange({ ...enemy, [field]: undefined as any });
        }
        return;
      }
      const numValue = parseFloat(value);
      if (Number.isNaN(numValue)) return;
      if (onPropertyChange) {
        onPropertyChange(field, numValue);
      } else {
        onChange({ ...enemy, [field]: numValue });
      }
    },
    [enemy, onChange, onPropertyChange]
  );

  const handleNameChange = useCallback(
    (value: string) => {
      if (onPropertyChange) {
        onPropertyChange("name", value);
      } else {
        onChange({ ...enemy, name: value });
      }
    },
    [enemy, onChange, onPropertyChange]
  );

  const Field = ({
    field,
    label,
    placeholder,
  }: {
    field: keyof Enemy;
    label: string;
    placeholder?: string;
  }) => (
    <div className="space-y-1">
      <Label htmlFor={field as string} className="text-xs">
        {label}
      </Label>
      <Input
        id={field as string}
        type="number"
        value={(enemy[field] as number | undefined) ?? ""}
        onChange={(e) => handleInputChange(field, e.target.value)}
        className="h-8 text-xs"
        placeholder={placeholder}
      />
    </div>
  );

  // Combat-type-specific keys
  const cap = combatType[0].toUpperCase() + combatType.slice(1);
  const defKey = `${combatType}Defense` as keyof Enemy;
  const evKey = `${combatType}Evasion` as keyof Enemy;
  const enKey = `${combatType}Endurance` as keyof Enemy;
  const heavyEvKey = `${combatType}HeavyAttackEvasion` as keyof Enemy;
  const bossEvKey = `boss${cap}Evasion` as keyof Enemy;
  const bossEnKey = `boss${cap}Endurance` as keyof Enemy;
  const bossHeavyEvKey = `boss${cap}HeavyAttackEvasion` as keyof Enemy;
  const typeName = TYPE_LABEL[combatType];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex-1">
          <Input
            type="text"
            value={enemy.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Enemy Name"
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
        <Section title={`${typeName} — Defense, Evasion, Endurance`} defaultOpen>
          <div className="grid grid-cols-2 gap-3">
            <Field field={defKey} label={`${typeName} Defense`} />
            <Field field={evKey} label={`${typeName} Evasion`} />
            <Field field={enKey} label={`${typeName} Endurance`} />
            <Field field={heavyEvKey} label={`${typeName} Heavy Evasion`} />
          </div>
        </Section>

        {!isPvP && (
          <Section title={`${typeName} — Boss Variants`} defaultOpen>
            <div className="grid grid-cols-2 gap-3">
              <Field field={bossEvKey} label={`Boss ${typeName} Evasion`} />
              <Field field={bossEnKey} label={`Boss ${typeName} Endurance`} />
              <Field field={bossHeavyEvKey} label={`Boss ${typeName} Heavy Evasion`} />
            </div>
          </Section>
        )}

        <Section title="Damage Reduction">
          <div className="grid grid-cols-2 gap-3">
            <Field field="damageReduction" label="Damage Reduction" />
            {!isPvP && <Field field="bossDamageReduction" label="Boss Damage Reduction" />}
          </div>
        </Section>

        <Section title="Resistances">
          <div className="grid grid-cols-2 gap-3">
            <Field field="skillDamageResistance" label="Skill Damage Resistance" />
            <Field field="weakenResistance" label="Weaken Resistance" />
            <Field field="criticalDamageResistance" label="Crit Damage Resistance %" />
            <Field field="shieldBlockChance" label="Shield Block Chance" />
          </div>
        </Section>
      </CardContent>
    </Card>
  );
});
