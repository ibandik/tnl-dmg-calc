import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "./input";

interface NumberInputProps {
  /** Current numeric value from parent (number, undefined, or null = treat as empty). */
  value: number | undefined | null;
  /** Called whenever the user types a valid number, or clears the field (undefined). */
  onValueChange: (value: number | undefined) => void;
  id?: string;
  className?: string;
  placeholder?: string;
  step?: string | number;
  min?: number;
  max?: number;
  disabled?: boolean;
}

/**
 * Numeric input that:
 *   - Holds local string state so typing/deleting doesn't snap to 0.
 *   - Empty string is reported as `undefined` (use ?? 0 at read sites if needed).
 *   - Re-syncs with the parent when the parent value changes externally
 *     (e.g. after an import) but NOT while the user is actively editing.
 */
export function NumberInput({
  value,
  onValueChange,
  ...rest
}: NumberInputProps) {
  const [local, setLocal] = useState<string>(
    value === undefined || value === null ? "" : String(value)
  );
  const editingRef = useRef(false);

  // Keep local in sync when the parent value changes from outside (import, reset),
  // but skip syncing while the input is focused / mid-edit.
  useEffect(() => {
    if (editingRef.current) return;
    const next = value === undefined || value === null ? "" : String(value);
    setLocal((prev) => (prev === next ? prev : next));
  }, [value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const text = e.target.value;
      setLocal(text);
      if (text === "" || text === "-") {
        onValueChange(undefined);
        return;
      }
      const n = parseFloat(text);
      if (!Number.isNaN(n)) onValueChange(n);
    },
    [onValueChange]
  );

  const handleFocus = useCallback(() => {
    editingRef.current = true;
  }, []);
  const handleBlur = useCallback(() => {
    editingRef.current = false;
    // Re-normalize: if parent value differs from local, re-sync from parent on blur.
    const next = value === undefined || value === null ? "" : String(value);
    if (local !== next) setLocal(next);
  }, [value, local]);

  return (
    <Input
      type="number"
      value={local}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...rest}
    />
  );
}
