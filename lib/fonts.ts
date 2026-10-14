import { Bitter, Caveat } from "next/font/google";

// Accent fonts used by a single section each. Apply `.variable` on the
// page wrapper that needs them so other pages don't load them.

// Handwriting on the four-square worksheet (Fraud page).
export const caveat = Caveat({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-caveat",
  display: "swap",
});

// Newspaper-style headlines on the Dealer Map news cards.
export const bitter = Bitter({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-bitter",
  display: "swap",
});
