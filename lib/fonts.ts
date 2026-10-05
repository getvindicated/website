import { Caveat } from "next/font/google";

// Accent font used by a single section. Apply `.variable` on the page
// wrapper that needs it so other pages don't load it.

// Handwriting on the four-square worksheet (Fraud page).
export const caveat = Caveat({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-caveat",
  display: "swap",
});

