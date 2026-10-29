import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/sections/shared/PageHero";
import { BoardApplyForm } from "@/components/sections/apply/BoardApplyForm";
import { NotifyForm } from "@/components/sections/apply/NotifyForm";
import { BoardStatus, chapterName } from "@/components/sections/apply/BoardStatus";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isValidLocale, localizeHref, type Locale } from "@/lib/i18n/config";
import { publicChapters, type PublicChapter } from "@/lib/apply/server";

// Board membership applications. Which chapters are open (and their
// positions) comes from the hub, so the page renders on every request.
export const dynamic = "force-dynamic";

export default async function ApplyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const dict = await getDictionary(locale as Locale);
  const d = dict.applyPage;
  const chapters: PublicChapter[] = await publicChapters().catch((e) => {
    console.error("[apply] Couldn't load chapters:", e instanceof Error ? e.message : e);
    return [];
  });
  const open = chapters.filter((c) => c.open);
  const closed = chapters.filter((c) => !c.open).map((c) => ({ id: c.id, name: chapterName(d, c.id) }));
  const volunteer = `${localizeHref(locale as Locale, "/join")}#apply`;

  return (
    <div className="rd rd-page">
      <PageHero title={d.hero.title} body={d.hero.body} />
      <section className="pt0">
        <div className="wrap apply-wrap">
          {chapters.length > 0 && <BoardStatus dict={d} chapters={chapters} locale={locale} label={dict.joinPage.board.statusLabel} />}
          {open.length > 0 ? (
            <>
              <h2 className="h2 mt56">{d.form.title}</h2>
              <BoardApplyForm
                dict={d}
                locale={locale}
                chapters={open.map((c) => ({ id: c.id, name: chapterName(d, c.id), positions: c.positions }))}
              />
              {closed.length > 0 && (
                <div className="apply-closed small">
                  <p>{d.closed.some.replace("{chapters}", closed.map((c) => c.name).join(", "))}</p>
                  <NotifyForm dict={d.closed} chapters={closed} locale={locale} />
                </div>
              )}
            </>
          ) : (
            <div className="apply-closed">
              <h2 className="h2">{d.closed.title}</h2>
              <p className="lede">{d.closed.body}</p>
              <div className="ctas">
                <Link className="btn btn-solid" href={volunteer}>
                  {d.closed.volunteer}
                </Link>
              </div>
              <NotifyForm dict={d.closed} chapters={closed} locale={locale} />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
