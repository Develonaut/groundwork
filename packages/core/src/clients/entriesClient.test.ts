import { describe, it, expect, beforeEach } from "vitest";
import { createEntriesClient } from "./entriesClient";
import { entriesStore } from "../stores/entriesStore";

describe("createEntriesClient", () => {
  const client = createEntriesClient();

  beforeEach(() => {
    entriesStore.setState({ entries: {} });
  });

  describe("getOrCreate", () => {
    it("creates a new entry for a date that does not exist", () => {
      const entry = client.getOrCreate("2026-04-13");

      expect(entry.date).toBe("2026-04-13");
      expect(entry.focus).toBe("");
      expect(entry.content).toBe("");
      expect(entry.id).toBeTruthy();
    });

    it("returns existing entry if one exists for that date", () => {
      const first = client.getOrCreate("2026-04-13");
      const second = client.getOrCreate("2026-04-13");

      expect(first.id).toBe(second.id);
    });

    it("persists the new entry to the store", () => {
      client.getOrCreate("2026-04-13");

      const stored = entriesStore.getState().entries["2026-04-13"];
      expect(stored).toBeDefined();
      expect(stored?.date).toBe("2026-04-13");
    });
  });

  describe("update", () => {
    it("updates focus on an existing entry", () => {
      client.getOrCreate("2026-04-13");
      const updated = client.update("2026-04-13", {
        focus: "half guard",
      });

      expect(updated?.focus).toBe("half guard");
    });

    it("updates content on an existing entry", () => {
      client.getOrCreate("2026-04-13");
      const updated = client.update("2026-04-13", {
        content: "Worked on framing",
      });

      expect(updated?.content).toBe("Worked on framing");
    });

    it("updates updatedAt timestamp", async () => {
      const original = client.getOrCreate("2026-04-13");
      // Ensure clock advances so updatedAt differs
      await new Promise((resolve) => setTimeout(resolve, 5));
      const updated = client.update("2026-04-13", { focus: "mount" });

      expect(updated?.updatedAt).not.toBe(original.updatedAt);
    });

    it("returns null for non-existent date", () => {
      const result = client.update("2026-01-01", { focus: "guard" });

      expect(result).toBeNull();
    });

    it("preserves fields not included in update", () => {
      client.getOrCreate("2026-04-13");
      client.update("2026-04-13", { focus: "guard" });
      const entry = client.update("2026-04-13", {
        content: "Notes here",
      });

      expect(entry?.focus).toBe("guard");
      expect(entry?.content).toBe("Notes here");
    });
  });

  describe("get", () => {
    it("returns entry for existing date", () => {
      client.getOrCreate("2026-04-13");
      const entry = client.get("2026-04-13");

      expect(entry?.date).toBe("2026-04-13");
    });

    it("returns null for non-existent date", () => {
      expect(client.get("2026-01-01")).toBeNull();
    });
  });

  describe("list", () => {
    it("returns empty array when no entries", () => {
      expect(client.list()).toEqual([]);
    });

    it("returns entries sorted newest-first", () => {
      client.getOrCreate("2026-04-11");
      client.getOrCreate("2026-04-13");
      client.getOrCreate("2026-04-12");

      const list = client.list();
      expect(list.map((e) => e.date)).toEqual(["2026-04-13", "2026-04-12", "2026-04-11"]);
    });
  });

  describe("store", () => {
    it("exposes the zustand store for reactive subscriptions", () => {
      expect(client.store).toBe(entriesStore);
    });
  });
});
