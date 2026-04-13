/**
 * Entries client — store-backed CRUD for daily journal entries.
 *
 * Owns the entries store. Provides domain methods (getOrCreate, update)
 * and exposes the store for reactive subscriptions in hooks.
 */

import { entriesStore } from "../stores/entriesStore";
import { entrySchema } from "../types/entry";
import type { Entry } from "../types/entry";

function makeEmptyEntry(date: string): Entry {
  const now = new Date().toISOString();
  return entrySchema.parse({
    id: crypto.randomUUID(),
    date,
    focus: "",
    content: "",
    createdAt: now,
    updatedAt: now,
  });
}

export function createEntriesClient() {
  return {
    store: entriesStore,

    /** Get an existing entry or create an empty one for the date. */
    getOrCreate(date: string) {
      const existing = entriesStore.getState().entries[date];
      if (existing) return existing;

      const entry = makeEmptyEntry(date);
      entriesStore.getState().upsert(entry);
      return entry;
    },

    /** Update an entry's focus and/or content. Returns null if not found. */
    update(date: string, data: { focus?: string; content?: string }) {
      const entry = entriesStore.getState().entries[date];
      if (!entry) return null;

      const updated = {
        ...entry,
        ...data,
        updatedAt: new Date().toISOString(),
      };
      entriesStore.getState().upsert(updated);
      return updated;
    },

    /** Get an entry by date. Returns null if not found. */
    get(date: string) {
      return entriesStore.getState().entries[date] ?? null;
    },

    /** List all entries sorted newest-first by date. */
    list() {
      return Object.values(entriesStore.getState().entries).sort((a, b) =>
        b.date.localeCompare(a.date),
      );
    },
  } as const;
}
