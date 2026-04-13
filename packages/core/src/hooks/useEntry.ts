"use client";

import { useMemo } from "react";
import { useStore } from "zustand";
import { entriesStore } from "../stores/entriesStore";

/**
 * Get a single entry by date — reactive, store-backed.
 *
 * Returns `{ data, isLoading }` matching React Query shape.
 * Pass an empty string to skip the lookup.
 */
export function useEntry(date: string) {
  const entries = useStore(entriesStore, (s) => s.entries);
  const data = useMemo(() => (date ? (entries[date] ?? null) : null), [date, entries]);
  return { data, isLoading: false };
}
