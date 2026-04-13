/** entriesStore — Zustand store with localStorage persistence. */

import type { StoreApi } from "zustand/vanilla";
import { createJSONStorage } from "zustand/middleware";
import { createEnhancedStore } from "./createEnhancedStore";
import type { Entry } from "../types/entry";

interface EntriesStoreState {
  entries: Record<string, Entry>;
  upsert: (entry: Entry) => void;
  remove: (date: string) => void;
}

export const entriesStore: StoreApi<EntriesStoreState> = createEnhancedStore<EntriesStoreState>({
  persist: {
    name: "groundwork-entries",
    partialize: (state) => ({ entries: state.entries }) as EntriesStoreState,
    storage: createJSONStorage(() => globalThis.localStorage),
  },
})((set) => ({
  entries: {},

  upsert: (entry) =>
    set((state) => {
      state.entries[entry.date] = entry;
    }),

  remove: (date) =>
    set((state) => {
      delete state.entries[date];
    }),
}));

export type { EntriesStoreState };
