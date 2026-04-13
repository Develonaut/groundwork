"use client";

import { useMemo } from "react";
import { useStore } from "zustand";
import { entriesStore } from "../stores/entriesStore";

/**
 * List all entries — reactive, store-backed.
 *
 * Returns Entry[] sorted newest-first. Re-renders when the
 * entriesStore changes (upsert, remove).
 */
export function useEntries() {
  const entries = useStore(entriesStore, (s) => s.entries);
  const data = useMemo(
    () => Object.values(entries).sort((a, b) => b.date.localeCompare(a.date)),
    [entries],
  );
  return { data, isLoading: false };
}
