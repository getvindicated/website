import type { EventText } from "./types";

// The Negotiation Workshop's wording in each language, filled in on setup
// (lib/board/setup.ts) for any language the event doesn't have yet. Admins
// edit or clear them on the hub's Events tab afterwards.
export const NEGOTIATION_TRANSLATIONS: Partial<Record<string, EventText>> = {};
