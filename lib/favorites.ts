"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "bodrum-estate:favorites";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter((x) => typeof x === "string");
    return [];
  } catch {
    return [];
  }
}

function write(ids: string[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(ids));
    // Defer so other `useFavorites` instances don't call setState while React is
    // still inside a setState updater (toggle/remove run write() synchronously there).
    queueMicrotask(() => {
      window.dispatchEvent(new Event("favorites:update"));
    });
  } catch {
    /* ignore */
  }
}

export function useFavorites() {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setIds(read());
    setReady(true);
    const sync = () => setIds(read());
    window.addEventListener("favorites:update", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("favorites:update", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  const toggle = useCallback(
    (id: string) => {
      setIds((current) => {
        const next = current.includes(id)
          ? current.filter((x) => x !== id)
          : [...current, id];
        write(next);
        return next;
      });
    },
    [],
  );

  const remove = useCallback((id: string) => {
    setIds((current) => {
      const next = current.filter((x) => x !== id);
      write(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setIds([]);
    write([]);
  }, []);

  return { ids, has, toggle, remove, clear, ready };
}
