import { redirect } from "next/navigation";
import { localizeHref, type Locale } from "@/lib/i18n/config";

// Merged into /join (tab: "General Contact"). Kept as a redirect so
// existing links/bookmarks to /contact don't break.
export default async function ContactRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(localizeHref(locale as Locale, "/join"));
}
