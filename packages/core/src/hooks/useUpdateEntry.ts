"use client";

import { useCallback } from "react";

/**
 * Returns an imperative update function for entries.
 *
 * Accepts a `core.entries` client reference to avoid importing
 * the singleton directly — keeps hooks testable.
 */
export function useUpdateEntry(
  update: (date: string, data: { focus?: string; content?: string }) => unknown,
) {
  return useCallback(
    (date: string, data: { focus?: string; content?: string }) => update(date, data),
    [update],
  );
}
