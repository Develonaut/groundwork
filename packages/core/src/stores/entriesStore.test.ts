import { describe, it, expect, beforeEach } from "vitest";
import { entriesStore } from "./entriesStore";
import type { Entry } from "../types/entry";

function makeEntry(overrides: Partial<Entry> = {}): Entry {
  return {
    id: crypto.randomUUID(),
    date: "2026-04-13",
    focus: "",
    content: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("entriesStore", () => {
  beforeEach(() => {
    entriesStore.setState({ entries: {} });
  });

  it("starts with empty entries", () => {
    expect(entriesStore.getState().entries).toEqual({});
  });

  it("upserts an entry keyed by date", () => {
    const entry = makeEntry({ date: "2026-04-13" });
    entriesStore.getState().upsert(entry);

    const stored = entriesStore.getState().entries["2026-04-13"];
    expect(stored).toEqual(entry);
  });

  it("overwrites existing entry on same date", () => {
    const first = makeEntry({ date: "2026-04-13", focus: "guard" });
    const second = makeEntry({ date: "2026-04-13", focus: "mount" });

    entriesStore.getState().upsert(first);
    entriesStore.getState().upsert(second);

    const stored = entriesStore.getState().entries["2026-04-13"];
    expect(stored?.focus).toBe("mount");
  });

  it("stores multiple entries by different dates", () => {
    entriesStore.getState().upsert(makeEntry({ date: "2026-04-13" }));
    entriesStore.getState().upsert(makeEntry({ date: "2026-04-14" }));

    const entries = entriesStore.getState().entries;
    expect(Object.keys(entries)).toHaveLength(2);
    expect(entries["2026-04-13"]).toBeDefined();
    expect(entries["2026-04-14"]).toBeDefined();
  });

  it("removes an entry by date", () => {
    entriesStore.getState().upsert(makeEntry({ date: "2026-04-13" }));
    entriesStore.getState().remove("2026-04-13");

    expect(entriesStore.getState().entries["2026-04-13"]).toBeUndefined();
  });

  it("remove is a no-op for non-existent date", () => {
    entriesStore.getState().upsert(makeEntry({ date: "2026-04-13" }));
    entriesStore.getState().remove("2026-01-01");

    expect(Object.keys(entriesStore.getState().entries)).toHaveLength(1);
  });

  it("produces immutable state on upsert", () => {
    const before = entriesStore.getState();
    entriesStore.getState().upsert(makeEntry({ date: "2026-04-13" }));
    const after = entriesStore.getState();

    expect(before.entries).not.toBe(after.entries);
  });
});
