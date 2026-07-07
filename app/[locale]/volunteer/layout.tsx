import { getRouteMetadata } from "@/lib/i18n/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return getRouteMetadata(locale, "volunteer", "/volunteer", "/preview.webp");
}

export default function VolunteerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
