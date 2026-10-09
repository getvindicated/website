// /board content that changes rarely and lives in code rather than the
// database. Copied from docs/board-preview.html.

import type { Tab } from "./types";

export const TERM = "UC Berkeley chapter · Board hub, Fall 2026";

// href: null shows the label with "(link to add)".
export const QUICK_LINKS: { label: string; text: string; href?: string | null; tab?: Tab }[] = [
  { label: "First meeting", text: "VINdicated Cal Meeting 1", href: null },
  { label: "General Google Drive for all info", text: "Google Drive folder", href: null },
  { label: "Socials planner", text: "Fall 2026 socials", tab: "socials" },
  { label: "Price Is Right calendar", text: "6-week plan", tab: "projects" },
];

export const KEY_DATES: [date: string, text: string][] = [
  ["2026-10-09", "Price Is Right: week 2 wraps (pipeline started, database set up)"],
  ["2026-10-12", "Round 2 deliverables due, 11:59pm. Missing any means off the board."],
  ["2026-10-16", "Price Is Right: pipeline connected to the app"],
  ["2026-10-30", "Price Is Right: car price component complete"],
  ["2026-11-06", "Price Is Right: final demo"],
];

// The round shown on the Assignments tab, and its deadline.
export const CURRENT_ROUND = { round: 2, label: "Round 2 · Due Mon, Oct 12, 11:59pm", due: "2026-10-12" };
export const ARCHIVE_ROUND = { round: 1, label: "Round 1 archive · due Sep 26" };

export const RULE =
  "every task lists the proof it needs. \"I reached out\" is not proof. If any of your deliverables is missing after the deadline, you are removed from the board. No extensions unless you ask Rana before the deadline.";

export const TEAM_ORDER = ["Data", "Software", "Research & Legal", "Outreach"] as const;

export const PROJECTS: { group: string; items: [name: string, chapter?: string][] }[] = [
  { group: "Tech", items: [["Project Duolingo"], ["Project Marketplace"], ["Project Crosscheck"], ["Project Carcam", "Berkeley"], ["Project Price Is Right", "Berkeley"]] },
  { group: "Research", items: [["Project Spanish Lang"], ["Project Price Gap"], ["Project Legal"], ["Uber Project"]] },
  { group: "Outreach & Content", items: [["Project Comics"], ["Project Spanish"], ["Project Booklet"]] },
];

export const PIR = {
  intro:
    "A game that teaches people what used cars are worth so they don't overpay. Players see a real car with its mileage, accident history, title status and region, guess the price, then see the fair price and what moved it up or down.",
  modes: "Quick Play (five random rounds) and a Daily Challenge where everyone gets the same car, with a streak counter.",
  screens: "Home, Round, Reveal (fair price, score, price breakdown, one scam tip), Summary.",
  howItFits:
    "a data pipeline collects listings and calculates fair prices, writes finished rounds to the database, the backend serves them through an API, and the React Native app reads only from that API.",
  credit: "Spec and calendar by Noirit, submitted Oct 8.",
};

export type Track = "Data" | "Backend" | "App";

export const WEEKS: { n: number; start: string; end: string; label: string; goal: string; items: [Track, string][] }[] = [
  { n: 1, start: "2026-09-28", end: "2026-10-02", label: "Sep 28 – Oct 2", goal: "Set up repo, database and app skeleton", items: [["Data", "Create a shared GitHub repo and add all tech members"], ["Backend", "Decide the database tech stack and tell all technical members"], ["App", "App scaffold and navigation plan"]] },
  { n: 2, start: "2026-10-05", end: "2026-10-09", label: "Oct 5 – 9", goal: "Choose data pipeline tools and sources, start building", items: [["Data", "Mon: agree on pipeline stack, what data to scrape and from where"], ["Data", "Tue: start building the data pipeline"], ["Backend", "Tue: set up the database"], ["App", "Tue: start building game screens with placeholder data"]] },
  { n: 3, start: "2026-10-12", end: "2026-10-16", label: "Oct 12 – 16", goal: "Finish data pipeline and connect it to the app through the database", items: [["Data", "Mon: finish pipeline implementation; from Tue, work with backend"], ["App", "Wed: connect game screens to real data"], ["Backend", "Fri: pipeline integrates with the app through the database"]] },
  { n: 4, start: "2026-10-19", end: "2026-10-23", label: "Oct 19 – 23", goal: "Fix bugs and keep backend in step with the app", items: [["Backend", "Fix bugs and keep up with the app's requirements"], ["App", "Build remaining features: guessing, scoring, price reveal"]] },
  { n: 5, start: "2026-10-26", end: "2026-10-30", label: "Oct 26 – 30", goal: "Finish the car price component", items: [["App", "Fri: car price component complete"]] },
  { n: 6, start: "2026-11-02", end: "2026-11-06", label: "Nov 2 – 6", goal: "Testing, bug fixes, final demo", items: [["App", "Mon: test the full game end to end"], ["Backend", "Wed: fix bugs found in testing"], ["App", "Fri: final demo"]] },
];

// Socials calendar: months people can page through (0-based month index).
export const SOCIAL_MONTHS = { year: 2026, first: 9, last: 11 };
export const SOCIAL_STATUSES = ["Idea", "Planning", "Confirmed", "Completed"] as const;
export const SOCIAL_KINDS: { key: "b" | "x" | "o"; label: string }[] = [
  { key: "b", label: "Berkeley" },
  { key: "x", label: "UCSC × UCB" },
  { key: "o", label: "Online" },
];
