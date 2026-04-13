/**
 * Vitest setup — stubs browser globals for Node test environment.
 *
 * Zustand persist middleware needs localStorage. This provides an
 * in-memory implementation so persisted stores work in tests.
 */

const store = new Map<string, string>();

globalThis.localStorage = {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => {
    store.set(key, value);
  },
  removeItem: (key: string) => {
    store.delete(key);
  },
  clear: () => store.clear(),
  get length() {
    return store.size;
  },
  key: () => null,
} as Storage;
