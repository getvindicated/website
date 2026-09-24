import type { SiteDictionary } from "../dictionary";
import en from "./en.json";

// en.json is the base dictionary every locale merges onto (see
// get-dictionary.ts) and, since ENGLISH_BYPASSES_DICT is off, the only
// place English copy lives. This line has no runtime effect -- its only
// job is to fail `tsc`/`next build` the moment en.json stops satisfying
// the full SiteDictionary shape (a field renamed, removed, or never
// added for a new team member), instead of that field silently
// rendering blank in the browser.
en satisfies SiteDictionary;
