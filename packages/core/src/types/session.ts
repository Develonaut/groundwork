/**
 * Core session types for Groundwork.
 *
 * Sessions represent a single training entry in the journal.
 */

export interface Session {
  id: string;
  userId: string;
  date: string;
  notes: string;
  duration?: number;
  location?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SessionInput {
  date: string;
  notes: string;
  duration?: number;
  location?: string;
  tags?: string[];
}
