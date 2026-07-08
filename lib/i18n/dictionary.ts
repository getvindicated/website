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

export type AboutTextSegment = { text?: string; bold?: boolean };

export type AboutDict = {
  hero?: {
    titlePlain?: string;
    titleEm?: string;
    subtitle?: string;
  };
  whyWeExist?: {
    titleLine1?: string;
    titleEm?: string;
    titleLine2?: string;
    para1?: AboutTextSegment[];
    para2?: AboutTextSegment[];
    para3?: AboutTextSegment[];
    para4?: string;
  };
  mission?: {
    heading?: string;
    headingEm?: string;
    subheading?: string;
    pillars?: { word?: string; body?: string }[];
  };
  story?: {
    titleEm?: string;
    subtitle?: string;
    strikes?: { num?: string; label?: string; body?: string[] }[];
    pullquote?: { quote?: string; attribution?: string };
    bio?: { label?: string; body?: string; closingLine?: string };
    wollstonecraft?: { label?: string; quote?: string };
  };
  provide?: {
    titlePlain?: string;
    titleEm?: string;
    subtitle?: string;
    items?: { cat?: string; title?: string; body?: string }[];
  };
};

export type RouteMetadataKey =
  | "home"
  | "about"
  | "team"
  | "inspection"
  | "fraud"
  | "documents"
  | "research"
  | "rights"
  | "contact"
  | "volunteer";

export type RouteMetadataDict = {
  title: string;
  description: string;
  imageAlt?: string;
};

export type SiteDictionary = {
  dir?: "ltr" | "rtl";
  nav: Record<string, string>;
  ui: {
    openMenu: string;
    closeMenu: string;
    expandSection: string;
    languageSwitcher: string;
  };
  footer: {
    tagline: string;
    subtagline: string;
    copyright: string;
    mission: string;
    columns: {
      navigate: string;
      resources: string;
      connect: string;
    };
    links: {
      linkedIn: string;
      instagram: string;
      getInTouch: string;
    };
  };
  meta: {
    defaultTitle: string;
    defaultDescription: string;
    routes: Record<RouteMetadataKey, RouteMetadataDict>;
  };
  home: HomeDict;
};
