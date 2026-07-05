// lib/i18n/home-dict.ts
// Shared shape for the homepage's translated content. Optional
// throughout: locales that don't have a "home" section yet (only en
// and es do, so far) simply render the English defaults baked into
// each component instead of crashing.

export type HomeDict = {
  hero?: {
    titleLine1?: string;
    titleLine2?: string;
    titleEm?: string;
    subtitle?: string;
    ctaPrimary?: string;
    ctaSecondary?: string;
    stats?: { label?: string; cite?: string }[];
  };
  cards?: {
    titlePrefix?: string;
    titleEm?: string;
    pillars?: { kicker?: string; title?: string; body?: string; label?: string }[];
  };
  quote?: {
    text?: string;
    cite?: string;
    source?: string;
  };
  founder?: {
    titleLine1?: string;
    titleEm?: string;
    body1?: string;
    body2Prefix?: string;
    body2Bold?: string;
    cta?: string;
  };
  meta?: {
    title?: string;
    description?: string;
  };
};
