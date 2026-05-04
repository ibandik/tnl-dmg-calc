import { useState, ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";

interface SectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  /** Optional right-aligned content next to the title (e.g. badge / count). */
  aside?: ReactNode;
  className?: string;
}

/**
 * Lightweight collapsible section.
 * Native disclosure feel without Radix; uses a button + transitioned chevron.
 */
export function Section({
  title,
  children,
  defaultOpen = false,
  aside,
  className,
}: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={cn("border border-border/60 rounded-md", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted/50 rounded-t-md text-sm font-medium"
        aria-expanded={open}
      >
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <ChevronRight
            className={cn(
              "h-3.5 w-3.5 transition-transform",
              open && "rotate-90"
            )}
          />
          <span className="text-foreground">{title}</span>
        </span>
        {aside && <span className="text-xs text-muted-foreground">{aside}</span>}
      </button>
      {open && <div className="px-3 pb-3 pt-1">{children}</div>}
    </div>
  );
}
