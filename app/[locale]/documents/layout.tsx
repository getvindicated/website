import { getRouteMetadata } from "@/lib/i18n/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return getRouteMetadata(locale, "documents", "/documents");
}

export default function DocumentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
