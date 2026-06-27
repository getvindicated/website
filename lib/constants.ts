// Design tokens — mirrors CSS custom properties in globals.css
// Use these in className strings or inline styles where needed.

export const colors = {
  bgPage: "#0d0814",
  bgSurface: "#160d24",
  bgMid: "#2a1040",
  brand: "#3f234a",
  vivid: "#5a3069",
  light: "#b088cc",
  accent: "#cf8bd8",
  border: "rgba(255,255,255,0.08)",
  red: "#d63b3b",
  gold: "#c9a84c",
  green: "#2d9e6b",
} as const;

// Nav links with optional dropdown items
export const navLinks = [
  { label: "Home", href: "/" },
  {
    label: "About",
    href: "/about",
    children: [
      { label: "Who We Are", href: "/about" },
      { label: "Our Mission", href: "/about#mission" },
      { label: "From the Founder", href: "/about#story" },
      { label: "What We Provide", href: "/about#vindicated-from" },
    ],
  },
  { label: "Team", href: "/team" },
  {
    label: "Inspection Guide",
    href: "/inspection",
    children: [
      { label: "What Is a PPI?", href: "/inspection" },
      { label: "Engine Diagram", href: "/inspection#engine-diagram" },
      { label: "What Inspectors Check", href: "/inspection#what-to-inspect" },
      { label: "Where to Get One", href: "/inspection#where-to-get" },
      { label: "Find a Dealership", href: "/inspection#dealer-locators" },
    ],
  },
  {
    label: "Fraud Prevention",
    href: "/fraud",
    children: [
      { label: "Overview", href: "/fraud" },
      { label: "Red Flags", href: "/fraud#red-flags" },
      { label: "Know Your Rights", href: "/fraud#know-your-rights" },
      { label: "What to Do After", href: "/fraud#after" },
    ],
  },
//   {
//     label: "Research",
//     href: "/research",
//     children: [
//       { label: "Our Approach", href: "/research" },
//       { label: "Active Studies", href: "/research#study1" },
//       { label: "Evidence Base", href: "/research#study2" },
//       { label: "Get Involved", href: "/research#get-involved" },
//     ],
//   },
  
  { label: "Contact", href: "/contact" },
] as const;

// Footer columns
export const footerNav = [
  {
    heading: "Navigate",
    links: [
      { label: "Home", href: "/" },
      { label: "About Us", href: "/about" },
      { label: "Team", href: "/team" },
      { label: "Documents", href: "/documents" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Inspection Guide", href: "/inspection" },
      { label: "Fraud Prevention", href: "/fraud" },
    //   { label: "Our Research", href: "/research" },
    //   { label: "PPI Guide", href: "/inspection" },
    //   { label: "Red Flag Checklist", href: "/fraud" },
    //   { label: "Our Studies", href: "/research" },
    ],
  },
  {
    heading: "Connect",
    links: [
      {
        label: "LinkedIn",
        href: "https://linkedin.com/company/vindicated",
        external: true,
      },
      { label: "Instagram", href: "https://instagram.com", external: true },
      { label: "Get in Touch", href: "/contact" },
    ],
  },
] as const;
