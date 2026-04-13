"use client";

/**
 * React-enhanced core singleton.
 *
 * Merges imperative clients from core.ts with React hooks for the
 * final public API. Consumers import `core` from this module.
 *
 * Usage:
 *   import { core } from "@groundwork/core";
 *   const { data } = core.entries.useEntry("2026-04-13");
 */

import { core as baseCore } from "./core";
import { useEntry } from "./hooks/useEntry";
import { useEntries } from "./hooks/useEntries";
import { useUpdateEntry } from "./hooks/useUpdateEntry";

export const core = {
  entries: {
    ...baseCore.entries,
    useEntry,
    useEntries,
    useUpdateEntry: () => useUpdateEntry(baseCore.entries.update),
  },
} as const;
