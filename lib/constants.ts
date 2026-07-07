// Design tokens — mirrors CSS custom properties in globals.css
// Use these in className strings or inline styles where needed.

export const colors = {
  bgPage: "#0d0814",
  bgSurface: "#160d24",
  bgMid: "#2a1040",
  brand: "#3f234a",
  vivid: "#9630a6",
light: "#c47fd4",
accent: "#d4a0e0",
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
    label: "Learning Resources",
    href: "/inspection",
    children: [
      { label: "Inspection Guide", href: "/inspection" },
      { label: "Fraud Prevention", href: "/fraud" },
      { label: "Documents Decoded", href: "/documents" },
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
  
  { label: "Get Involved", href: "/join" },
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
      { label: "Get Involved", href: "/join" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Inspection Guide", href: "/inspection" },
      { label: "Fraud Prevention", href: "/fraud" },
{ label: "Documents", href: "/documents" },
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
      { label: "Get in Touch", href: "/join" },
    ],
  },
] as const;
