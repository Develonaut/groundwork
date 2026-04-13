"use client";

/**
 * @groundwork/core — Transport-agnostic API layer for Groundwork.
 *
 * UI code imports from this package for all data operations.
 * Never import from database adapters directly.
 */

// Core singleton (imperative + React hooks merged)
export { core } from "./reactCore";

// Types
export type { Entry } from "./types/entry";
export { entrySchema } from "./types/entry";

// Store factories (for app-layer orchestration)
export { createEnhancedStore } from "./stores/createEnhancedStore";
