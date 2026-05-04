import { Share2 } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

interface HeaderProps {
  combatType: "melee" | "ranged" | "magic";
  onCombatTypeChange: (t: "melee" | "ranged" | "magic") => void;
  isPvP: boolean;
  onIsPvPChange: (v: boolean) => void;
  onShare: () => void;
}

const combatTypes: { value: "melee" | "ranged" | "magic"; label: string }[] = [
  { value: "melee", label: "Melee" },
  { value: "ranged", label: "Ranged" },
  { value: "magic", label: "Magic" },
];

function Pill<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex rounded-md border border-border/60 bg-muted/30 p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "px-3 py-1 text-xs font-medium rounded-sm transition-colors",
            value === opt.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function Header({
  combatType,
  onCombatTypeChange,
  isPvP,
  onIsPvPChange,
  onShare,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto h-14 flex items-center gap-4 px-6">
        <h1 className="text-base font-semibold tracking-tight">
          T&amp;L Damage Calculator
        </h1>
        <div className="flex-1" />
        <div className="flex items-center gap-3">
          <Pill
            options={combatTypes}
            value={combatType}
            onChange={onCombatTypeChange}
          />
          <Pill
            options={[
              { value: "pve", label: "PvE" },
              { value: "pvp", label: "PvP" },
            ]}
            value={isPvP ? "pvp" : "pve"}
            onChange={(v) => onIsPvPChange(v === "pvp")}
          />
          <Button
            onClick={onShare}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title="Share"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
