import { redirect } from "next/navigation";
import { localizeHref, type Locale } from "@/lib/i18n/config";

// Merged into /join (tab: "Apply to Volunteer"). Kept as a redirect so
// existing links/bookmarks to /volunteer don't break.
export default async function VolunteerRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(localizeHref(locale as Locale, "/join"));
}
