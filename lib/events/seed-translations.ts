import type { EventText } from "./types";

// The Negotiation Workshop's wording in each language, filled in on setup
// (lib/board/setup.ts) for any language the event doesn't have yet. Admins
// edit or clear them on the hub's Events tab afterwards.
export const NEGOTIATION_TRANSLATIONS: Partial<Record<string, EventText>> = {
  es: {
    title: "Taller de negociación con Emily Epstein",
    tag: "Taller · UC Berkeley",
    hostTitle: "Profesora de negociación, UC Berkeley Law · CEO, Oakbay Consulting",
    description:
      "Aprende a negociar el precio de un carro, y cualquier otra cosa, con alguien que lo enseña en Berkeley Law. Trae tus preguntas.",
  },
};
