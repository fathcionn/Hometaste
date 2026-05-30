import { useEffect, useState } from "react";

export function useDebounce<TValue>(value: TValue, delayMs: number): TValue {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [delayMs, value]);

  return debounced;
}
