/**
 * Core singleton — imperative, framework-agnostic API.
 *
 * Wires clients together. This is the base layer that reactCore.ts
 * enhances with React hooks for the final public `core` export.
 *
 * 1 domain (MVP): entries.
 *
 * Dependency flow:
 *   core.ts -> clients -> stores -> localStorage
 */

import { createEntriesClient } from "./clients/entriesClient";

const entriesClient = createEntriesClient();

export const core = {
  entries: entriesClient,
} as const;
