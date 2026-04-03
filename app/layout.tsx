import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { CarCursor } from "@/components/ui/CarCursor";

export const metadata: Metadata = {
  title: {
    default: "VINdicated — Educate. Empower. Vindicate.",
    template: "%s | VINdicated",
  },
  description:
    "VINdicated is a nonprofit built on the belief that car knowledge should be public knowledge. We break down the systems that allow consumer discrimination to thrive.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <CarCursor />
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
