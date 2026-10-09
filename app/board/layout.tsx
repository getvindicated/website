import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./board.css";

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-lato",
  display: "swap",
});

// Private: never indexed, never cached by search engines.
export const metadata: Metadata = {
  title: "VINdicated",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function BoardLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`board ${lato.variable}`}>{children}</body>
    </html>
  );
}
