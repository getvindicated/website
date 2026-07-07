import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://getvindicated.org",
  ),
  title: "404: Page Not Found",
  description: "This page doesn't exist. Return to VINdicated to find the resources you need.",
  openGraph: {
    title: "404: Page Not Found",
    description: "This page doesn't exist. Return to VINdicated to find the resources you need.",
    type: "website",
    images: [{ url: "/illus-woman-dealership.png", alt: "VINdicated" }],
  },
};

export default function NotFound() {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center px-4">
        <h1 className="text-9xl font-bold mb-4">404</h1>
        <p className="text-lg mb-6">
          Sorry, we couldn&apos;t find the page you were looking for.
        </p>
        <a
          href="/"
          className="px-4 py-2 bg-purple-950 text-white rounded-2xl hover:opacity-80 transition"
        >
          Return Home
        </a>
      </div>
    );
  }
