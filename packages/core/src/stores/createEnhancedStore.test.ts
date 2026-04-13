import { describe, it, expect } from "vitest";
import { createEnhancedStore } from "./createEnhancedStore";

interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
}

describe("createEnhancedStore", () => {
  it("creates a store with initial state", () => {
    const store = createEnhancedStore<CounterState>()((set) => ({
      count: 0,
      increment: () =>
        set((s) => {
          s.count += 1;
        }),
      decrement: () =>
        set((s) => {
          s.count -= 1;
        }),
    }));

    expect(store.getState().count).toBe(0);
  });

  it("supports immer draft mutations", () => {
    const store = createEnhancedStore<CounterState>()((set) => ({
      count: 0,
      increment: () =>
        set((s) => {
          s.count += 1;
        }),
      decrement: () =>
        set((s) => {
          s.count -= 1;
        }),
    }));

    store.getState().increment();
    expect(store.getState().count).toBe(1);

    store.getState().increment();
    expect(store.getState().count).toBe(2);

    store.getState().decrement();
    expect(store.getState().count).toBe(1);
  });

  it("produces immutable state updates", () => {
    const store = createEnhancedStore<CounterState>()((set) => ({
      count: 0,
      increment: () =>
        set((s) => {
          s.count += 1;
        }),
      decrement: () =>
        set((s) => {
          s.count -= 1;
        }),
    }));

    const before = store.getState();
    store.getState().increment();
    const after = store.getState();

    expect(before).not.toBe(after);
    expect(before.count).toBe(0);
    expect(after.count).toBe(1);
  });

  it("works without options (no persist)", () => {
    const store = createEnhancedStore<CounterState>()((set) => ({
      count: 10,
      increment: () =>
        set((s) => {
          s.count += 1;
        }),
      decrement: () =>
        set((s) => {
          s.count -= 1;
        }),
    }));

    expect(store.getState().count).toBe(10);
    store.getState().increment();
    expect(store.getState().count).toBe(11);
  });

  it("subscribes to state changes", () => {
    const store = createEnhancedStore<CounterState>()((set) => ({
      count: 0,
      increment: () =>
        set((s) => {
          s.count += 1;
        }),
      decrement: () =>
        set((s) => {
          s.count -= 1;
        }),
    }));

    const states: number[] = [];
    store.subscribe((state) => states.push(state.count));

    store.getState().increment();
    store.getState().increment();
    store.getState().decrement();

    expect(states).toEqual([1, 2, 1]);
  });
});
