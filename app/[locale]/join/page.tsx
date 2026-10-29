import Link from "next/link";
import { PageHero } from "@/components/sections/shared/PageHero";
import { ApplyForm } from "@/components/sections/join/ApplyForm";
import { ContactForm } from "@/components/sections/join/ContactForm";
import { BoardStatus } from "@/components/sections/apply/BoardStatus";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { localizeHref, type Locale } from "@/lib/i18n/config";
import { publicChapters } from "@/lib/apply/server";

// The board applications section shows each chapter's status from the hub,
// so the page renders on every request.
export const dynamic = "force-dynamic";

// Minimum weekly hours per role, same order as joinPage.roles.items.
const ROLE_HOURS = [5, 5, 5, 3, 3, 3];

export default async function JoinPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const d = dict.joinPage;
  const boards = await publicChapters().catch((e) => {
    console.error("[apply] Couldn't load chapters:", e instanceof Error ? e.message : e);
    return [];
  });

  return (
    <div className="rd rd-page">
      <PageHero title={d.hero.title} body={d.hero.body}>
        <div className="ctas">
          <Link className="btn btn-solid" href="#apply">
            {d.hero.ctaPrimary}
          </Link>
          <Link className="btn btn-line" href="#chapters">
            {d.hero.ctaSecondary}
          </Link>
        </div>
      </PageHero>

      <section className="pt0" id="chapters">
        <div className="wrap">
          <div className="center">
            <h2 className="h2">{d.chapters.title}</h2>
          </div>
          <div className="chapters">
            {d.chapters.items.map((c) => (
              <div className="card chapter" key={c.name}>
                <span className="tag">{c.tag}</span>
                <h3>{c.name}</h3>
                <div className="u">{c.school}</div>
                <p className="d">{c.focus}</p>
                <div className="leads">
                  <strong>{d.chapters.leadsLabel}</strong> {c.leads}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pt0" id="board">
        <div className="wrap apply-wrap board-cta">
          <h2 className="h2">{d.board.title}</h2>
          <p className="lede">{d.board.body}</p>
          {boards.length > 0 && <BoardStatus dict={dict.applyPage} chapters={boards} locale={locale} label={d.board.statusLabel} />}
          <div className="ctas">
            <Link className="btn btn-solid" href={localizeHref(locale as Locale, "/apply")}>
              {d.board.cta}
            </Link>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <div className="center">
            <h2 className="h2">{d.roles.title}</h2>
            <p className="lede">{d.roles.body}</p>
          </div>
          <ul className="roles">
            {d.roles.items.map((r, i) => (
              <li key={r}>
                <b>{r}</b>
                {d.roles.hours.replace("{n}", String(ROLE_HOURS[i]))}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="apply">
        <div className="wrap apply-wrap">
          <h2 className="h2">{d.form.title}</h2>
          <ApplyForm dict={d} locale={locale} />
        </div>
      </section>

      <section className="band" id="contact">
        <div className="wrap apply-wrap">
          <h2 className="h2">{d.contact.title}</h2>
          <p className="lede mt18">{d.contact.body}</p>
          <ContactForm dict={d.contact} locale={locale} />
        </div>
      </section>
    </div>
  );
}
