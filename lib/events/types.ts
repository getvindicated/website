// Public events (the /events page). Shared by the server and the browser.
// Nothing here carries the private meeting link.

// School or affiliation choices on the RSVP form. The label stored with an
// RSVP is the English one in SCHOOL_LABELS; the page shows the translated
// label from the dictionary.
export const SCHOOLS = ["berkeley", "ucla", "ucsc", "other", "none"] as const;
export type School = (typeof SCHOOLS)[number];
export const SCHOOL_LABELS: Record<School, string> = {
  berkeley: "UC Berkeley",
  ucla: "UCLA",
  ucsc: "UC Santa Cruz",
  other: "Another school",
  none: "Not a student",
};

// An event's wording in another language. Fields left out show the English.
export const EVENT_TEXT = ["title", "tag", "hostTitle", "description"] as const;
export type EventText = Partial<Record<(typeof EVENT_TEXT)[number], string>>;
export type EventTranslations = Partial<Record<string, EventText>>;

// What the public page and API may show about an event.
export type PublicEvent = {
  id: number;
  title: string;
  tag: string;
  date: string; // YYYY-MM-DD, Pacific
  startTime: string; // HH:MM, Pacific
  endTime: string;
  startsAt: string; // ISO instant
  endsAt: string;
  online: boolean;
  address: string;
  hostName: string;
  hostTitle: string;
  description: string;
  flyer: string | null; // public address of the flyer image
  // RSVPs so far, only when the event has "Show RSVP count" on.
  count: number | null;
  past: boolean;
};

// What admins see on the hub's Events tab.
export type AdminEvent = Omit<PublicEvent, "flyer" | "count"> & {
  chapter: string;
  meetingLink: string;
  flyerId: number | null;
  translations: EventTranslations;
  showCount: boolean;
  rsvps: Rsvp[];
};

export type Rsvp = {
  id: number;
  name: string;
  email: string;
  school: string;
  question: string;
  optIn: boolean;
  at: string; // ISO
};
