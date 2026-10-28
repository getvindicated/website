#!/usr/bin/env node
// Checks every language file against en.json. Fails (exit 1) when a
// language:
//   - is missing a key from en.json, or has a key en.json doesn't
//   - changes the {placeholders} or <markup> in a string
//   - still has a string in English: the same as en.json, or a sentence
//     that's mostly English words
// English that's allowed to stay (names, brands, agencies, bill numbers,
// legal citations) is listed below.
//
//   node scripts/check-i18n.mjs            all languages
//   node scripts/check-i18n.mjs es ko      just these
//   node scripts/check-i18n.mjs --verbose  list every problem

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "lib", "i18n", "dictionaries");
const args = process.argv.slice(2);
const verbose = args.includes("--verbose");
const only = args.filter((a) => !a.startsWith("--"));

const load = (f) => JSON.parse(readFileSync(join(DIR, f), "utf8"));
const en = load("en.json");

// Every leaf as path -> value. Arrays use [i].
function flatten(v, path = "", out = new Map()) {
  if (Array.isArray(v)) v.forEach((x, i) => flatten(x, `${path}[${i}]`, out));
  else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) flatten(x, path ? `${path}.${k}` : k, out);
  else out.set(path, v);
  return out;
}

// Keys whose value may stay exactly as in English.
const SAME_OK = [
  /\.citation$/, // legal citations (15 U.S.C. § 1601, Cal. Civ. Code §…)
  /\.(name|hostName|handle|leads)$/,
  /^rightsPage\.stateNames\./, // state names many languages write the same
  /^footer\.links\.linkedIn$/,
  /^teamPage\.socials\./,
  /^mapPage\.app\.pageTitle$/,
];

// English words and names that can appear in any language.
const ALLOWED = [
  "VINdicated", "VINDICATED", "Carfax", "AutoCheck", "CARS Act", "CARS", "Act", "FTC", "DMV", "CFPB", "VIN", "APR", "PPI",
  "UC Berkeley", "Berkeley", "UCLA", "UC Santa Cruz", "Santa Cruz", "UCSC", "UC", "LA", "Westside",
  "Zoom", "Google", "Google Maps", "Facebook", "Facebook Marketplace", "Marketplace", "Instagram", "LinkedIn", "GitHub", "TikTok",
  "Kelley Blue Book", "KBB", "Edmunds", "NADA", "AAA", "Lemon Squad", "CARCHEX", "Mitsubishi", "Toyota", "Honda", "Ford", "Nissan",
  "Chevrolet", "Hyundai", "Mazda", "Volkswagen", "SB", "AB", "TILA", "ECOA", "FCRA", "DTPA", "CLRA", "Rosenthal", "Unruh",
  "Holder Rule", "Buyers Guide", "Oakbay Consulting", "Oakbay", "The Drive", "CalMatters", "PIRG", "Hinshaw", "Culbertson",
  "Ayres", "Siegelman", "The American Economic Review", "National Fair Housing Alliance", "Emily Epstein", "Epstein", "Emily",
  "Caleb Jacobs", "Rana", "Darwich", "Esri", "Maxar", "Supabase", "OpenStreetMap", "CARTO", "AI", "PDF", "MB", "PT", "AM", "PM",
  "CA", "TX", "NY", "NJ", "CT", "MA", "AK", "WI", "ME", "DOJ", "DOT", "AG", "BMV", "SOS", "Cal", "Civ", "Code", "Veh",
  "Price Is Right", "Crosscheck", "Morning Consult", "Caribou", "Mary Wollstonecraft", "Wollstonecraft", "South Coast Mitsubishi", "Carcam", "Duolingo", "U.S.C.", "CFR", "Mass", "Tex", "Occ", "ch", "Trans", "Admin",
  "SwiftUI", "Swift", "React Native", "Expo", "APIs", "API",
];

// One-word strings that are spelled the same as English in a language.
const SAME_WORDS = {
  es: ["Dealer", "Total", "No"],
};

// Common English words: a sentence with several of these is still English.
const EN_WORDS = new Set(
  "the and you your with that this for are is was what when where have has can will not they their from about before after into than then them there these those would could should which while because every other only also just".split(
    " ",
  ),
);

const names = new Set(Object.keys(en.team?.members ?? {}).flatMap((n) => [n, ...n.split(/\s+/)]));

function englishLeft(s) {
  let t = s;
  for (const a of [...ALLOWED].sort((x, y) => y.length - x.length)) t = t.split(a).join(" ");
  for (const n of names) if (n.length > 2) t = t.split(n).join(" ");
  t = t.replace(/https?:\/\/\S+|\S+@\S+|\{\w+\}|<\/?\w+[^>]*>|§+\s*[\d.]+/g, " ");
  const words = t.match(/[A-Za-z][A-Za-z'’-]*/g) ?? [];
  return words;
}

const placeholders = (s) => [...s.matchAll(/\{\w+\}/g)].map((m) => m[0]).sort().join(",");
const markup = (s) => [...s.matchAll(/<\/?\w+[^>]*>/g)].map((m) => m[0]).sort().join(",");

const enFlat = flatten(en);
const files = readdirSync(DIR).filter((f) => f.endsWith(".json") && f !== "en.json");
let failed = false;

for (const file of files) {
  const lang = file.replace(/\.json$/, "");
  if (only.length && !only.includes(lang)) continue;
  const flat = flatten(load(file));
  const problems = { missing: [], extra: [], placeholders: [], markup: [], english: [] };
  const latin = ["es", "tl", "vi"].includes(lang);

  for (const [k, v] of enFlat) {
    if (!flat.has(k)) problems.missing.push(k);
    else if (typeof v === "string") {
      const t = flat.get(k);
      if (typeof t !== "string") {
        problems.missing.push(`${k} (not text)`);
        continue;
      }
      if (placeholders(t) !== placeholders(v)) problems.placeholders.push(`${k}: ${placeholders(v)} -> ${placeholders(t)}`);
      if (markup(t) !== markup(v)) problems.markup.push(k);
      const same = t === v && SAME_OK.every((re) => !re.test(k)) && !(SAME_WORDS[lang] ?? []).includes(t);
      const words = englishLeft(t);
      // Same as English and has real words left: untranslated. Otherwise,
      // in Latin scripts look for several common English words; in other
      // scripts, for English glue words or a string that's mostly English
      // letters (tech and company names on their own are fine).
      const enCommon = words.filter((w) => EN_WORDS.has(w.toLowerCase())).length;
      const latinShare = words.join("").length / Math.max(t.replace(/[\s\d\p{P}\p{S}]/gu, "").length, 1);
      const leak = same
        ? words.length > 0
        : latin
          ? enCommon >= 3 && enCommon / Math.max(words.length, 1) > 0.2
          : enCommon >= 2 || (words.length >= 3 && latinShare > 0.5);
      if (leak) problems.english.push(`${k}: ${t.slice(0, 90)}`);
    }
  }
  for (const k of flat.keys()) if (!enFlat.has(k)) problems.extra.push(k);

  const total = Object.values(problems).reduce((n, p) => n + p.length, 0);
  console.log(`${total ? "✗" : "✓"} ${lang}: ${total ? Object.entries(problems).filter(([, p]) => p.length).map(([n, p]) => `${p.length} ${n}`).join(", ") : "ok"}`);
  if (total) {
    failed = true;
    for (const [n, p] of Object.entries(problems)) {
      if (!p.length) continue;
      for (const line of verbose ? p : p.slice(0, 5)) console.log(`    ${n}: ${line}`);
      if (!verbose && p.length > 5) console.log(`    … ${p.length - 5} more (--verbose)`);
    }
  }
}
process.exit(failed ? 1 : 0);
