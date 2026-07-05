name: "i18n: migrate structure"

# Manual trigger only — go to the Actions tab, pick this workflow,
# click "Run workflow". It restructures app/ for locale routing and
# opens a pull request with the result. Nothing touches main directly;
# you review and merge the PR yourself, same as any other change.

on:
  workflow_dispatch:

permissions:
  contents: write
  pull-requests: write

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "22"

      - name: Run migration script
        run: node scripts/migrate-i18n.mjs

      - name: Open pull request with the result
        uses: peter-evans/create-pull-request@v6
        with:
          commit-message: "i18n: restructure app/ for locale routing + add scaffold"
          title: "i18n: restructure app/ for locale routing + add scaffold"
          body: |
            Automated structural migration for multi-language support.

            **What this does:**
            - Moves every page route under `app/[locale]/...`
            - Adds `lib/i18n/config.ts` (locale list, native labels, RTL flags)
            - Adds `lib/i18n/get-dictionary.ts` (dictionary loader)
            - Adds `lib/i18n/dictionaries/*.json` (nav + footer strings, translated, for all 10 languages)
            - Adds `middleware.ts` (locale detection + routing)
            - Adds `components/layout/LanguageSwitcher.tsx`

            **What this does NOT do (on purpose — needs a careful follow-up pass):**
            - `app/[locale]/layout.tsx` still needs `generateStaticParams()`, the `<html lang=/dir=>` attributes, and `params.locale` wiring
            - `Nav.tsx` / `Footer.tsx` still import labels from `lib/constants.ts` — need to switch to the dictionary
            - `<LanguageSwitcher />` isn't inserted into the nav yet
            - Page body copy (inspection guide, fraud tactics, Carfax walkthrough, etc.) is not yet translated — only nav/footer strings are

            Review the file moves below, then merge. Bring the diff back to Claude for the next pass once this is in.
          branch: i18n-scaffold
          delete-branch: true
