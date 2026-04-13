import { describe, it, expect } from "vitest";
import { entrySchema } from "./entry";

const validEntry = {
  id: "abc-123",
  date: "2026-04-13",
  focus: "half guard retention",
  content: "Worked on framing and hip escapes",
  createdAt: "2026-04-13T10:00:00.000Z",
  updatedAt: "2026-04-13T10:30:00.000Z",
};

describe("entrySchema", () => {
  it("accepts a valid entry", () => {
    const result = entrySchema.safeParse(validEntry);
    expect(result.success).toBe(true);
  });

  it("accepts empty focus and content", () => {
    const result = entrySchema.safeParse({
      ...validEntry,
      focus: "",
      content: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing id", () => {
    const { id: _, ...noId } = validEntry;
    expect(entrySchema.safeParse(noId).success).toBe(false);
  });

  it("rejects empty id", () => {
    const result = entrySchema.safeParse({ ...validEntry, id: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid date format", () => {
    const result = entrySchema.safeParse({
      ...validEntry,
      date: "April 13, 2026",
    });
    expect(result.success).toBe(false);
  });

  it("rejects date with wrong separator", () => {
    const result = entrySchema.safeParse({
      ...validEntry,
      date: "2026/04/13",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid createdAt timestamp", () => {
    const result = entrySchema.safeParse({
      ...validEntry,
      createdAt: "not-a-date",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    expect(entrySchema.safeParse({}).success).toBe(false);
    expect(entrySchema.safeParse({ id: "1" }).success).toBe(false);
  });
});
