import { getRouteMetadata } from "@/lib/i18n/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return getRouteMetadata(locale, "apply", "/apply");
}

export default function ApplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
