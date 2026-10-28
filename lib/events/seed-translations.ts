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
  "zh-Hans": {
    title: "谈判讲座：Emily Epstein 主讲",
    tag: "讲座 · UC Berkeley",
    hostTitle: "UC Berkeley Law 谈判课讲师 · Oakbay Consulting CEO",
    description: "跟在 Berkeley Law 教谈判的老师学怎么砍车价，学会了别的东西也能谈。带上你的问题来吧。",
  },
};
