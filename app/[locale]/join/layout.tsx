import { getRouteMetadata } from "@/lib/i18n/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return getRouteMetadata(locale, "join", "/join");
}

export default function JoinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
