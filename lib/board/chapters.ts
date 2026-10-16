// Per-chapter settings for the board hub. Berkeley lives at /board and UCLA
// at /board/ucla; both run the same pages and components, which read their
// differences from here. Nothing secret goes in this file: it's shipped to
// the browser. Passwords and email recipients are in chapter-server.ts.

import { KEY_DATES, PIR, PROJECTS, QUICK_LINKS, RULE, TEAM_ORDER, TERM, WEEKS } from "./static";
import type { Round, Tab } from "./types";

export const CHAPTER_IDS = ["berkeley", "ucla"] as const;
export type ChapterId = (typeof CHAPTER_IDS)[number];
export const isChapterId = (v: unknown): v is ChapterId => typeof v === "string" && (CHAPTER_IDS as readonly string[]).includes(v);

// A paragraph with an optional bold lead-in ("Data:" …).
export type Para = { b?: string; t: string };
export type TimelineWeek = { n: number; start: string; end: string; label: string; goal: string; items: [track: string, text: string][] };

export type ChapterConfig = {
  id: ChapterId;
  path: string;
  title: string;
  term: string;
  loginSub: string;
  // Who members are told to ask when something isn't set up.
  contact: string;
  // For people who landed on the wrong hub: shown on sign-in and Home.
  otherHub: { prompt: string; label: string; path: string };
  roleLabels: Record<string, string>;
  teams: readonly string[];
  rule: string | null;
  proofRequired: boolean;
  // UCLA keeps one status per person per week and starts new weeks itself.
  weekly: boolean;
  roundLabel: (r: Round, current: boolean) => string;
  glance: { members: string; submissions: string; socials: string };
  quickLinks: { label?: string; text: string; href?: string | null; tab?: Tab }[];
  keyDates: [date: string, text: string][];
  photos: string[];
  // A second row of photos under the first (optional).
  photosRow2?: string[];
  socials: {
    heading: string;
    kinds: { key: "b" | "o"; label: string }[];
    tags: Record<string, string>;
    add: string;
    list: string;
    note: string;
    defaultLead: string;
  };
  projects: {
    groups: { group: string; items: [name: string, chapter?: string][] }[];
    sections: { title: string; cols: Para[][]; credit?: string }[];
    timeline: { title: string; tracks: string[]; weeks: TimelineWeek[]; graceDays: number };
  };
  meetings: { heading: string; note: string | null; attendance: boolean };
  submit: { note: string; placeholder: string; filesLabel: string; needProof: string };
  myPage: { meetingLine: string | null; teamTrack: Record<string, string>; teamNote: Record<string, string> };
};

// UCLA's second photo row (added Oct 15).
export const UCLA_ROW2 = [7, 8, 9, 10, 11, 12, 13, 14].map((n) => `/board/ucla/board-${n}.webp`);

const shortDay = (iso: string, o: Intl.DateTimeFormatOptions) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", o);
};

const BERKELEY: ChapterConfig = {
  id: "berkeley",
  path: "/board",
  title: "VINdicated at Berkeley",
  term: TERM,
  loginSub: "UC Berkeley chapter board",
  contact: "Rana",
  otherHub: { prompt: "Why am I on this chuz school's page?", label: "Take me to UCLA's hub", path: "/board/ucla" },
  roleLabels: { admin: "admin", socials: "socials editor", member: "board member" },
  teams: TEAM_ORDER,
  rule: RULE,
  proofRequired: true,
  weekly: false,
  roundLabel: (r, current) =>
    current
      ? `Round ${r.round} · Due ${shortDay(r.dueDate, { weekday: "short", month: "short", day: "numeric" })}, 11:59pm`
      : `Round ${r.round} archive · due ${shortDay(r.dueDate, { month: "short", day: "numeric" })}`,
  glance: { members: "members on the Berkeley board", submissions: "round 2 submissions in", socials: "socials on the calendar" },
  quickLinks: QUICK_LINKS,
  keyDates: KEY_DATES,
  photos: [],
  socials: {
    heading: "Fall 2026 Socials",
    kinds: [
      { key: "b", label: "Berkeley" },
      { key: "o", label: "Online" },
    ],
    tags: { b: "Berkeley", o: "Online", org: "Org date" },
    add: "Add a social",
    list: "All socials",
    note: "Status runs Idea → Planning → Confirmed → Completed.",
    defaultLead: "TBD",
  },
  projects: {
    groups: PROJECTS,
    sections: [
      {
        title: "Project Price Is Right",
        cols: [
          [{ t: PIR.intro }, { b: "Modes:", t: PIR.modes }, { b: "Screens:", t: PIR.screens }],
          [{ b: "How it fits together:", t: PIR.howItFits }],
        ],
        credit: PIR.credit,
      },
    ],
    timeline: { title: "6-week calendar", tracks: ["Data", "Backend", "App"], weeks: WEEKS, graceDays: 2 },
  },
  meetings: { heading: "Meeting Summaries & Recordings", note: null, attendance: false },
  submit: {
    note: "This form emails your submission and any files to Rana. Attach proof or paste a link to it in the notes.",
    placeholder: "Paste your write-up, call notes, links, or anything Rana should read.",
    filesLabel: "Proof (required unless you paste a link above): screenshots, docs, call logs. Up to 14 MB in total.",
    needProof: "Add proof: attach a file or paste a link to your post, doc or PR.",
  },
  myPage: {
    meetingLine: null,
    teamTrack: { Data: "Data", Software: "App" },
    teamNote: {},
  },
};

const UCLA_WEEKS: TimelineWeek[] = [
  { n: 1, label: "Sep 20 – 26", start: "2026-09-20", end: "2026-09-26", goal: "Projects locked, recruiting open", items: [["Data", "Scope locked, IIHS API application submitted, recruiting open"], ["Research", "Finalize the three projects and start finding faculty mentors"], ["Outreach", "Bruinwalk tabling: Guess the OTD Price game"], ["High school", "Research how to start a chapter at FVHS and find an advisor"]] },
  { n: 2, label: "Sep 27 – Oct 3", start: "2026-09-27", end: "2026-10-03", goal: "Teams in place", items: [["Data", "Team of 4 in place; NHTSA data loaded and its gaps documented"], ["Research", "Recruit and onboard members; intro to qualitative research and ethics"], ["Outreach", "IG Question of the Week; design \"too good to be true\" listings"], ["High school", "Start the chapter process and recruit through connections"]] },
  { n: 3, label: "Oct 4 – 10", start: "2026-10-04", end: "2026-10-10", goal: "First real work", items: [["Data", "A canonical vehicle list and a pipeline every member can run"], ["Research", "Preliminary research: what's known, the debates, the gaps"], ["Outreach", "Board intro video; tape fake listings around campus"], ["High school", "Finalize materials and pick a first student activity"]] },
  { n: 4, label: "Oct 11 – 17", start: "2026-10-11", end: "2026-10-17", goal: "Methods and first match", items: [["Data", "First working match between NHTSA and IIHS; output shape locked"], ["Research", "Set the method, source criteria and research plan"], ["Outreach", "Bruinwalk tabling: sticky-note whiteboard"], ["High school", "Launch first resources and a short student survey"]] },
  { n: 5, label: "Oct 18 – 24", start: "2026-10-18", end: "2026-10-24", goal: "Collect", items: [["Data", "Go / no-go on IIHS access; one table with both programs' ratings"], ["Research", "Collect sources: literature, ads, complaints, legal documents"], ["Outreach", "Midterm break: event recap on IG, plan interviews"], ["High school", "First student-facing table or activity"]] },
  { n: 6, label: "Oct 25 – 31", start: "2026-10-25", end: "2026-10-31", goal: "First findings", items: [["Data", "First findings: how often the programs disagree, and where"], ["Research", "Analyze materials for themes and patterns"], ["Outreach", "Quick on-campus interviews for IG; plan the dorm event"], ["High school", "Review results; ask the board to fact-check materials"]] },
  { n: 7, label: "Nov 1 – 7", start: "2026-11-01", end: "2026-11-07", goal: "Broader findings", items: [["Data", "One finding no existing car site has"], ["Research", "Move from observations to broader findings"], ["Outreach", "Dorm event: car-buying basics and DIY air freshener sachets"], ["High school", "Reach out to local driving schools and partners"]] },
  { n: 8, label: "Nov 8 – 14", start: "2026-11-08", end: "2026-11-14", goal: "MVP", items: [["Data", "MVP running end to end, rough but nothing faked"], ["Research", "Turn findings into practical takeaways"], ["Outreach", "Edit interviews"], ["High school", "Develop one outside partnership"]] },
  { n: 9, label: "Nov 15 – 21", start: "2026-11-15", end: "2026-11-21", goal: "Write it up", items: [["Data", "MVP complete, frozen, documented and reproducible"], ["Research", "Write and revise the final product; peer review"], ["Outreach", "Edit interviews"], ["High school", "Plan a bigger second-semester event"]] },
  { n: 10, label: "Nov 22 – 28", start: "2026-11-22", end: "2026-11-28", goal: "Demo and wrap-up", items: [["Data", "Demo and writeup"], ["Research", "Limitations and future research"], ["Outreach", "Post interview reels"], ["High school", "Compile results from the first 10 weeks"]] },
];

const UCLA: ChapterConfig = {
  id: "ucla",
  path: "/board/ucla",
  title: "VINdicated at UCLA",
  term: "UCLA chapter · Board hub, Fall 2026",
  loginSub: "UCLA chapter board hub",
  contact: "Fiona",
  otherHub: { prompt: "Why am I on this chuz school's page?", label: "Take me to Berkeley's hub", path: "/board" },
  roleLabels: { admin: "admin", socials: "events editor", member: "member" },
  teams: ["Data", "Research", "App Dev", "Design", "Technical Writing", "High School"],
  rule: null,
  proofRequired: false,
  weekly: true,
  roundLabel: (r, current) =>
    current
      ? `Deliverables · Due ${shortDay(r.dueDate, { weekday: "short", month: "short", day: "numeric" })}`
      : `Week due ${shortDay(r.dueDate, { weekday: "short", month: "short", day: "numeric" })}`,
  glance: { members: "people on the UCLA chart", submissions: "deliverable sets submitted", socials: "events on the calendar" },
  quickLinks: [
    { text: "Member Drive 2025–26", href: null },
    { text: "2025–2026 Curriculum", href: null },
    { text: "Google Drive for photos", href: null },
    { text: "Outreach spreadsheets", href: null },
    { label: "Slack", text: "vindicatedgroup", href: "https://join.slack.com/t/vindicatedgroup/shared_invite/zt-4bavmrqhi-XJb9OIt4aRq6SpGaNyoKtg" },
    { label: "Board meetings", text: "Sundays, 6–6:30pm" },
  ],
  keyDates: [
    ["2026-10-18", "Oct 11 deliverables due"],
    ["2026-10-21", "Skribbl night with Berkeley, 9pm"],
    ["2026-10-25", "Data: first findings (week 6)"],
    ["2026-11-08", "Data: MVP running end to end (week 8)"],
    ["2026-11-22", "Crosscheck demo and research writeups (week 10)"],
  ],
  photos: [1, 2, 3, 4, 5, 6].map((n) => `/board/ucla/board-${n}.webp`),
  photosRow2: UCLA_ROW2,
  socials: {
    heading: "Fall 2026 Events",
    kinds: [
      { key: "b", label: "On campus" },
      { key: "o", label: "Online" },
    ],
    tags: { b: "On campus", o: "Online", org: "Date" },
    add: "Add an event",
    list: "All events",
    note: "Status runs Idea → Planning → Confirmed → Completed. Days marked TBD come from the outreach timeline, which plans by week.",
    defaultLead: "",
  },
  projects: {
    groups: [
      { group: "Data", items: [["Project Crosscheck"]] },
      { group: "Research", items: [["Language, Trust & Access"], ["The Hidden Price Gap"], ["After the Accident: Know Your Rights"]] },
      { group: "App Dev", items: [["DMV test practice"], ["Interactive quizzes"], ["Crash list and safety scores by model"]] },
      { group: "Outreach", items: [["Bruinwalk tabling"], ["Scam-awareness listings"], ["Dorm event"], ["IG Question of the Week"]] },
      { group: "High School", items: [["First-Car Survival campaign, Fountain Valley HS"]] },
    ],
    sections: [
      {
        title: "Project Crosscheck",
        cols: [
          [
            { t: "A public, side-by-side table of NHTSA and IIHS safety ratings for model years 2023–2026, built into the VINdicated site." },
            { b: "Question for v1:", t: "how often do NHTSA and IIHS ratings disagree? Which one better predicts real-world outcomes is saved for v2." },
          ],
          [
            { b: "Data:", t: "NHTSA ratings are public. IIHS needs an approved API key; the application is in." },
            { b: "Rules:", t: "no combined safety score, no scraping iihs.org, and the public table is generated by the pipeline, never edited by hand." },
          ],
        ],
      },
      {
        title: "Research projects",
        cols: [
          [
            { b: "Language, Trust & Access:", t: "how multilingual consumers experience communication, trust and access to information at dealerships." },
            { b: "The Hidden Price Gap:", t: "what makes car pricing hard to understand: dealer add-ons, fees, \"starting at\" prices and monthly payment ads." },
          ],
          [
            { b: "After the Accident: Know Your Rights:", t: "a plain-language California guide for when something goes wrong: accidents, dealer disputes, fraud, repair and financing problems." },
          ],
        ],
      },
    ],
    timeline: { title: "Fall quarter timeline", tracks: ["Data", "Research", "Outreach", "High school"], weeks: UCLA_WEEKS, graceDays: 0 },
  },
  meetings: { heading: "Board Meetings", note: "Sundays, 6–6:30pm.", attendance: true },
  submit: {
    note: "This form emails your update and any files to the board. Attach files or paste links in the notes.",
    placeholder: "Paste your update, links, or anything Fiona should read.",
    filesLabel: "Files: docs, screenshots, designs. Up to 14 MB in total.",
    needProof: "Add an update or attach a file before submitting.",
  },
  myPage: {
    meetingLine: "Board meeting, Sundays 6–6:30pm",
    teamTrack: { Data: "Data", Research: "Research", "High School": "High school" },
    teamNote: {
      "App Dev": "App ideas: DMV test practice, interactive quizzes, and a crash list with safety scores by model.",
      Design: "Start or continue your plan, and update Fiona on progress.",
      "Technical Writing": "Start or continue your plan, and update Fiona on progress.",
      Executive: "Board operations: Sunday board meetings, deliverables, collabs and the signatory workshop.",
    },
  },
};

export const CHAPTERS: Record<ChapterId, ChapterConfig> = { berkeley: BERKELEY, ucla: UCLA };
export const chapterConfig = (id: ChapterId) => CHAPTERS[id];
