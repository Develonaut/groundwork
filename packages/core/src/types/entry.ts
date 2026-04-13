import { z } from "zod";

/** Zod schema for a daily journal entry. */
export const entrySchema = z.object({
  id: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
  focus: z.string(),
  content: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

/** A daily journal entry — one per day, keyed by date (YYYY-MM-DD). */
export type Entry = z.infer<typeof entrySchema>;
