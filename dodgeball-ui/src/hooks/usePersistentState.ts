import { useEffect, useMemo, useState } from "react";

type Options = {
  /**
   * Optional schema/version tag. If you bump it, the hook will ignore old saved data.
   */
  version?: number;
};

type PersistedPayload<T> = {
  v: number;
  value: T;
};

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function usePersistentState<T>(key: string, initialValue: T, options?: Options) {
  const version = options?.version ?? 1;

  const storageKey = useMemo(() => `${key}`, [key]);

  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;

    const payload = safeParse<PersistedPayload<T>>(localStorage.getItem(storageKey));
    if (!payload) return initialValue;
    if (payload.v !== version) return initialValue;
    return payload.value;
  });

  useEffect(() => {
    try {
      const payload: PersistedPayload<T> = { v: version, value };
      localStorage.setItem(storageKey, JSON.stringify(payload));
    } catch {
      // ignore (quota, private mode, etc.)
    }
  }, [storageKey, value, version]);

  return [value, setValue] as const;
}
