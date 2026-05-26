# VINdicated — Developer Documentation

VINdicated is a nonprofit website built with Next.js 16, React 19, Tailwind CSS v4, and TypeScript. It helps car buyers navigate dealerships without being taken advantage of, providing free guides, research, and know-your-rights resources.

## Table of Contents

- [Getting Started](#getting-started)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Routes](#routes)
- [Complex UI Systems](#complex-ui-systems)
- [Data Flows](#data-flows)
- [Design System](#design-system)
- [Environment Variables](#environment-variables)

---

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The app auto-reloads on file changes.

```bash
pnpm build   # production build
pnpm start   # serve production build
pnpm lint    # ESLint with auto-fix
pnpm lint:fix  # Prettier formatting
```

> **Important:** This project uses Next.js 16 with React 19 — APIs and conventions may differ from older versions. Read `node_modules/next/dist/docs/` before writing new code.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4 |
| Language | TypeScript 5 |
| Email | Brevo (`@getbrevo/brevo`) |
| Fonts | Space Grotesk (headings), DM Sans (body) via `next/font/google` |
| Package manager | pnpm |

---

## Project Structure

```
app/                    # Next.js App Router pages & layouts
  layout.tsx            # Root layout — fonts, Nav, Footer, CarCursor
  page.tsx              # Home page
  globals.css           # Design tokens (CSS vars), animations, base styles
  about/page.tsx        # About Us
  contact/
    layout.tsx          # Contact layout (sets per-section metadata)
    page.tsx            # Contact page with server action form
  documents/
    layout.tsx
    page.tsx            # Interactive document decoder (Carfax, Buyers Guide)
  fraud/
    layout.tsx
    page.tsx            # Fraud prevention: Pink Slip explainer, red flags, KYR
  inspection/
    layout.tsx
    page.tsx            # Pre-purchase inspection guide with engine diagram
  research/page.tsx     # Research & studies
  rights/page.tsx       # Know Your Rights (law reference cards)
  not-found.tsx         # 404 page
  sitemap.ts            # Auto-generated XML sitemap
  robots.ts             # robots.txt
  actions/
    email.ts            # Server Action: contact form submission

components/
  layout/
    Nav.tsx             # Sticky navbar with dropdowns & mobile overlay
    Footer.tsx          # Site footer with nav columns
  sections/             # Page-level section components (homepage only)
    RoadScene.tsx       # Animated road banner (homepage hero backdrop)
    HomeHero.tsx        # Hero with animated counter stats
    HomeDashboard.tsx   # Animated gauge bar widget
    HomeSections.tsx    # HomeCards, HomeQuote, HomeFounder (all exported from here)
    HomeCards.tsx       # Re-export from HomeSections
    HomeQuote.tsx       # Re-export from HomeSections
    HomeFounder.tsx     # Re-export from HomeSections
    StudyCard.tsx       # Research study card widget
  ui/
    index.tsx           # All shared UI primitives (see Design System)
    CarCursor.tsx       # Custom SVG car cursor with click-burst animation

lib/
  brevo.ts              # Brevo email client wrapper
  constants.ts          # Design tokens (JS), navLinks, footerNav

public/                 # Static assets (images, icons, illustrations)
```

---

## Routes

| Route | File | Purpose |
|---|---|---|
| `/` | `app/page.tsx` | Home page — RoadScene banner, hero stats, dashboard gauges, cards, quote, founder section |
| `/about` | `app/about/page.tsx` | About page — discrimination research stats, mission (Educate/Empower/Vindicate), founder story, services |
| `/inspection` | `app/inspection/page.tsx` | Pre-purchase inspection guide — what a PPI is, interactive engine diagram, inspection checklist, dealer locator |
| `/fraud` | `app/fraud/page.tsx` | Fraud prevention — interactive Pink Slip document explainer, dealer red flags accordion, Know Your Rights laws, post-scam checklist |
| `/documents` | `app/documents/page.tsx` | Document decoder — interactive annotated walkthrough of a Carfax report and Buyers Guide |
| `/research` | `app/research/page.tsx` | Research page — methodology, active studies (UCLA collaboration), evidence base stats, references |
| `/rights` | `app/rights/page.tsx` | Know Your Rights — plain-English reference cards for federal and California consumer protection laws |
| `/contact` | `app/contact/page.tsx` | Contact page — form (client component) that submits via Server Action to Brevo email API |
| `/not-found` | `app/not-found.tsx` | 404 page |
| `/sitemap.xml` | `app/sitemap.ts` | Auto-generated sitemap (uses `NEXT_PUBLIC_SITE_URL`) |
| `/robots.txt` | `app/robots.ts` | Auto-generated robots file |

### Route sub-sections (anchor links in nav)

The navbar uses `lib/constants.ts#navLinks` to define dropdown children. Sub-sections use `#hash` anchors within their parent routes:

| Route | Section anchors |
|---|---|
| `/about` | `#mission`, `#story`, `#vindicated-from` |
| `/inspection` | `#engine-diagram`, `#what-to-inspect`, `#where-to-get`, `#dealer-locators` |
| `/fraud` | `#red-flags`, `#know-your-rights`, `#after` |
| `/research` | `#study1`, `#study2`, `#get-involved` |
| `/documents` | `#ex-carfax1`, `#ex-carfax2`, `#ex-buyers-guide` |

---

## Complex UI Systems

### 1. Custom Car Cursor (`components/ui/CarCursor.tsx`)

Replaces the browser cursor site-wide with a purple SVG car.

- Rendered once in `app/layout.tsx` as a client component.
- On mount, injects two DOM elements into `<body>`: `#car-cursor` (the SVG car) and `#click-burst` (particle container).
- `mousemove` positions the cursor element via `style.left/top`.
- `mousedown` adds `.clicking` (scales down via CSS) and spawns 8 `<span>` particles in `#click-burst`. Each particle has `--dx`/`--dy` CSS variables set to random radial offsets; a `cburst` CSS keyframe animates them outward and fades them out (450ms).
- `mouseup` removes `.clicking`.
- All event listeners and DOM nodes are cleaned up in the `useEffect` return function.
- `cursor: none !important` in `globals.css` hides the native cursor everywhere.

### 2. Road Scene (`components/sections/RoadScene.tsx`)

Decorative animated banner that sits between the fixed Nav and the home hero, creating the illusion of a car driving along a night road.

- **Stars**: 5 absolutely positioned dots with `star-twinkle` CSS animation (random delays and durations for asynchronous blinking).
- **Road stripes**: 5 `<div>` elements with staggered negative `animation-delay` values on `road-stripes` keyframe, creating the appearance of continuous stripe flow from right to left.
- **Car**: A `<Image>` element with the `car-drive` CSS animation — enters from `left: -340px`, exits at `left: 110%` over 13 seconds, loops infinitely.
- No JavaScript animation logic; purely declarative CSS.

### 3. FadeUp (`components/ui/index.tsx`)

Scroll-triggered fade-in + slide-up wrapper used to animate nearly every page section.

- Creates a `<div>` with class `fade-up` (starts at `opacity: 0; transform: translateY(30px)`).
- On mount, attaches an `IntersectionObserver` with `threshold: 0.1` to the wrapper.
- When the element enters the viewport, adds the `visible` class (via `classList.add`), which CSS transitions to `opacity: 1; translateY(0)`.
- Observer is disconnected on unmount.

### 4. Animated Counter Stats (`components/sections/HomeHero.tsx`)

Four stat numbers in the home hero that animate from 0 to their target values on page load.

- Each stat has a corresponding DOM `id` (`stat1`–`stat4`), target value, prefix/suffix, and animation duration.
- On mount, a `600ms` `setTimeout` fires `animateCount()` for each stat.
- `animateCount` uses `requestAnimationFrame` with a cubic ease-out (`1 - (1 - t)^3`) to interpolate the displayed number. Text is updated each frame via `el.textContent`.
- A `triggered` ref prevents re-running on hot reload.

### 5. Dashboard Gauge Bars (`components/sections/HomeDashboard.tsx`)

Animated horizontal progress bars in the "Impact at a Glance" section.

- Each gauge `<div>` starts with `width: 0` (via `.gauge-fill` CSS class).
- On mount, `setTimeout` calls are staggered by `200ms` per gauge, setting each bar's `style.width` to its target percentage.
- CSS `transition: width 1.6s ease` handles the smooth animation.
- A `triggered` ref prevents re-running.

### 6. Interactive Document Hotspot System

Used in two places with the same interaction model:

**PinkSlipExplainer** (`app/fraud/page.tsx`):
- Displays a California Certificate of Title image with 6 numbered `<button>` pins positioned absolutely over the image.
- State: `active: number | null` tracked with `useState`.
- Clicking a pin sets it as active; clicking again deactivates (toggle). Only one pin can be active at a time.
- When a pin is active:
  - The corresponding highlight overlay (`position: absolute`, `pointer-events: none`) fades in via `opacity` transition, drawing a colored border+background rectangle over the relevant document section.
  - The explanation panel on the right renders the `cardData[active]` card with `slide-up` CSS animation.
  - Navigation dots below the card let the user jump directly to any pin.
- The document image is `brightness(0.88) saturate(0.75)` by default; `brightness(1)` when any pin is active.

**DocExhibit** (`app/documents/page.tsx`):
- A reusable component (same concept) used for the Carfax report and Buyers Guide exhibits.
- Same `active` state pattern; same pin/highlight/card architecture.

**Engine Diagram** (`app/inspection/page.tsx`):
- Similar pin system over an engine photo with 10 color-coded pins (green = easy to check, gold = watch carefully, red = serious red flag, purple = informational).
- Selecting a pin shows a sticky side panel with part name, description, and what to look for.

### 7. Navigation (`components/layout/Nav.tsx`)

Fixed top navbar with scroll-aware styling, desktop dropdowns, and a mobile fullscreen overlay.

- **Scroll effect**: `window.scroll` listener sets `scrolled` state. Background opacity transitions from `0.85` to `0.97` when `scrollY > 50`.
- **Desktop dropdowns**: Hover intent handled via a debounced close timer (`closeTimer` ref, 300ms). `onMouseEnter` on a `<li>` clears the timer and opens that item's dropdown; `onMouseLeave` starts the 300ms timer to close it. This prevents the dropdown from flickering when moving the mouse between the trigger and the menu.
- **Mobile menu**: Hamburger button toggles `menuOpen`. When open, a fullscreen overlay (`position: fixed; inset: 0`) renders all links. Automatically closes on route change via a `usePathname` effect.
- **Active state**: `isActive()` checks `pathname === href` for `/` and `pathname.startsWith(href)` for all other routes, providing underline decoration.
- Nav links and dropdown items are sourced from `lib/constants.ts#navLinks`.

### 8. Contact Form (`app/contact/page.tsx`)

Client-side form component that calls a Next.js Server Action.

- `ContactForm` is a `"use client"` component managing state: `submitted`, `isSubmitting`, `error`.
- On submit, prevents default, collects `FormData`, calls the `submitContactForm` Server Action.
- Shows inline success/error feedback. Success state auto-dismisses after 5 seconds via `setTimeout`.
- The form and all state are co-located within the page file rather than a separate file.

### 9. Accordion (`components/ui/index.tsx`)

Single-open accordion used for the fraud red flags list.

- `openIndex: number | null` state. Clicking an item sets `openIndex` to that item's index, or `null` if it was already open (toggle).
- Expand/collapse icon is a `+` character rotated 45° via CSS `transform` when open.
- Supports a `defaultOpen` prop per item (finds the first `defaultOpen: true` item as initial state).

---

## Data Flows

### Contact Form → Email

```
User fills out contact form (app/contact/page.tsx)
  → form onSubmit handler
    → calls submitContactForm(data) [app/actions/email.ts] — Next.js Server Action
      → validates required fields (email, message)
      → calls sendEmail() [lib/brevo.ts] × 2:
          1. Admin notification → getvindicated@outlook.com
             (subject: "New Contact Form Submission: {topic}", reply-to: user's email)
          2. Auto-response → user's email
             (subject: "We've received your message - VINdicated")
      → returns { success: true } or { success: false, error: string }
  → ContactForm updates UI state (submitted / error)
```

**Key files**: `app/actions/email.ts`, `lib/brevo.ts`  
**External service**: Brevo Transactional Email API (`BREVO_API_KEY` env var required)

### Navigation & Footer Links

All nav and footer links are defined as a single source of truth in `lib/constants.ts`:

```
lib/constants.ts (navLinks, footerNav)
  → components/layout/Nav.tsx   (desktop dropdowns + mobile menu)
  → components/layout/Footer.tsx (footer column links)
```

To add, remove, or rename a route in the nav or footer, only `lib/constants.ts` needs to change.

### Page Metadata

Each page exports a `Metadata` object (Next.js App Router convention). The root layout (`app/layout.tsx`) sets global defaults including `metadataBase` (used to resolve relative OG image URLs):

```
app/layout.tsx
  metadataBase = NEXT_PUBLIC_SITE_URL ?? "https://getvindicated.org"
  title.template = "%s | VINdicated"

app/about/page.tsx (example)
  title: "About Us"        → renders as "About Us | VINdicated"
  openGraph.url: "/about"  → resolved relative to metadataBase
```

### Sitemap

`app/sitemap.ts` returns a static array of all public routes. It reads `NEXT_PUBLIC_SITE_URL` for the base URL and is automatically served at `/sitemap.xml` by Next.js.

### Design Token Flow

CSS custom properties are defined once in `globals.css` and mirrored as a JS object in `lib/constants.ts#colors`. Inline styles in components that need dynamic values (e.g., conditionally applied colors) reference the CSS variable strings directly (`"var(--color-vivid)"`).

```
app/globals.css  (:root { --color-vivid: #5a3069; ... })
  → consumed by Tailwind v4 utilities and component inline styles

lib/constants.ts (colors: { vivid: "#5a3069", ... })
  → available for JS-side color references if needed
```

---

## Design System

All shared UI primitives are exported from `components/ui/index.tsx`:

| Component | Purpose |
|---|---|
| `Button` | Primary and outline CTAs. Renders as `<Link>` when `href` is provided, `<button>` otherwise. Supports `external` prop for `target="_blank"`. |
| `PageHero` | Full-width page header with kicker label, large heading, and optional subtitle. Used on every inner page. |
| `SectionLabel` | Small uppercase-style label above section headings. |
| `SectionTitle` | Large `<h2>` with responsive fluid font sizing via `clamp()`. |
| `Divider` | Full-width `<hr>` with `--color-border` styling. |
| `FadeUp` | Scroll-triggered fade-in wrapper (see Complex UI Systems above). |
| `Pullquote` | Styled `<blockquote>` with left border and cite line. |
| `WarningBox` | Red-accented callout box for danger warnings. |
| `InfoBox` | Purple-accented callout box for informational notes. |
| `Checklist` | Arrow-prefixed list of bold label + descriptive text pairs. |
| `Accordion` | Single-open expandable list (see Complex UI Systems above). |
| `CardGrid` | Responsive grid of numbered cards with optional link. Hover turns background to brand purple. |
| `Tag` | Small pill label for tagging research studies. |

### Typography

- **Headings** (`h1`–`h4`): Space Grotesk, loaded via `next/font/google`, CSS variable `--font-heading`
- **Body**: DM Sans, CSS variable `--font-body`
- **`<em>` in headings**: Renders as underlined text (not italic) via `globals.css`. The underline color is `--color-accent` (lavender).

### Color Palette

| Token | Hex | Usage |
|---|---|---|
| `--color-bg-page` | `#0d0814` | Page background |
| `--color-bg-surface` | `#160d24` | Card/section background |
| `--color-bg-mid` | `#2a1040` | Mid-level surface |
| `--color-brand` | `#3f234a` | Road color, brand fills |
| `--color-vivid` | `#5a3069` | Primary CTA, active states |
| `--color-light` | `#b088cc` | Primary text accent, nav active |
| `--color-accent` | `#cf8bd8` | Heading em underlines, icon accents |
| `--color-border` | `rgba(255,255,255,0.08)` | Borders, dividers |
| `--color-red` | `#d63b3b` | Danger states, fraud warnings |
| `--color-gold` | `#c9a84c` | Caution states, road stripes |
| `--color-green` | `#2d9e6b` | Safe/informational states |

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `BREVO_API_KEY` | Yes (for contact form) | Brevo transactional email API key |
| `NEXT_PUBLIC_SITE_URL` | No | Base URL for sitemap and OG metadata. Defaults to `https://getvindicated.org` |

Copy `.env.example` to `.env.local` and fill in `BREVO_API_KEY` to enable the contact form in local development.
  
