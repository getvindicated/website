import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Involved",
  description:
    "Get involved with VINdicated: volunteer with our team, share your story, participate in research, or partner with us.",
  openGraph: {
    title: "Get Involved",
    description:
      "Get involved with VINdicated: volunteer with our team, share your story, participate in research, or partner with us.",
    url: "/join",
    type: "website",
    images: [{ url: "/illus-woman-dealership.png", alt: "VINdicated: Get Involved" }],
  },
  twitter: {
    title: "Get Involved",
    description:
      "Get involved with VINdicated: volunteer with our team, share your story, participate in research, or partner with us.",
  },
};

export default function JoinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
