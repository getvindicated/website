import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with VINdicated — volunteer with our team, share your story, participate in research, or partner with us.",
  openGraph: {
    title: "Contact",
    description:
      "Get in touch with VINdicated — volunteer with our team, share your story, participate in research, or partner with us.",
    url: "/contact",
    type: "website",
    images: [{ url: "/logo-full.png", alt: "VINdicated — Contact" }],
  },
  twitter: {
    title: "Contact",
    description:
      "Get in touch with VINdicated — volunteer with our team, share your story, participate in research, or partner with us.",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
