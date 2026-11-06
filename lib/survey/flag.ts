import { WORDING_APPROVED } from "./questions";

// Whether the survey is public: the Railway variable SURVEY_PUBLIC set to
// exactly "true", and the item wording approved in lib/survey/questions.ts.
// Until then /survey is a 404 for everyone but hub admins, and the links on
// the home page, in Learning Resources and in the sitemap stay hidden (see
// BOARD_SETUP.md). Static pages read this at build time; Railway rebuilds
// when the variable changes.
//
// SURVEY_ALLOW_DRAFT_WORDING=true lets the end-to-end test
// (scripts/test-survey.mjs) try the public survey before the wording is
// approved. Never set it in Railway.
export const surveyPublic = () =>
  process.env.SURVEY_PUBLIC === "true" && (WORDING_APPROVED || process.env.SURVEY_ALLOW_DRAFT_WORDING === "true");
