/**
 * Enhanced store factory — wraps zustand/vanilla + immer + optional persist.
 *
 * All Zustand stores in the Groundwork codebase should use this factory
 * instead of importing from `zustand/vanilla` directly. This gives us a
 * single place to add cross-cutting middleware (devtools, logging, etc.)
 * and ensures every store gets immer's immutable-update ergonomics for free.
 *
 * Ported from @bnto/core — same factory signature and behavior.
 *
 * Usage (basic):
 *   const store = createEnhancedStore<MyState>()((set) => ({
 *     count: 0,
 *     increment: () => set((s) => { s.count += 1; }),
 *   }));
 *
 * Usage (with persistence):
 *   const store = createEnhancedStore<MyState>({ persist: { name: "my-store" } })(
 *     (set) => ({
 *       count: 0,
 *       increment: () => set((s) => { s.count += 1; }),
 *     }),
 *   );
 */

import { createStore } from "zustand/vanilla";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";
import type { StateCreator } from "zustand/vanilla";
import type { PersistOptions } from "zustand/middleware";

interface EnhancedStoreOptions<T> {
  /** Enable persistence. Pass `{ name: "store-key" }` to opt in. */
  persist?: Pick<PersistOptions<T>, "name" | "partialize" | "version" | "migrate" | "storage">;
}

/**
 * Create a Zustand vanilla store with immer middleware baked in.
 *
 * Optionally wraps with `persist` middleware when `options.persist`
 * is provided. Returns a curried function matching zustand's
 * `createStore<T>()(initializer)` pattern so type inference works.
 */
export function createEnhancedStore<T>(options?: EnhancedStoreOptions<T>) {
  return (initializer: StateCreator<T, [["zustand/immer", never]]>) => {
    if (options?.persist) {
      return createStore<T>()(
        persist(
          immer(initializer) as StateCreator<T, [["zustand/persist", unknown]]>,
          options.persist,
        ),
      );
    }
    return createStore<T>()(immer(initializer));
  };
}

export type { EnhancedStoreOptions };
