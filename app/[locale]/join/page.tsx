import Link from "next/link";
import { ApplyForm } from "@/components/sections/join/ApplyForm";
import { ContactForm } from "@/components/sections/join/ContactForm";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import "../../minimal.css";

// Minimum weekly hours per role, same order as joinPage.roles.items.
const ROLE_HOURS = [5, 5, 5, 3, 3, 3];

export default async function JoinPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const d = (await getDictionary(locale as Locale)).joinPage;

  return (
    <div className="rd rd-page mn">
      <div className="mn-col">
        <h1>{d.hero.title}</h1>
        <p className="mn-lead">{d.hero.body}</p>
        <div className="mn-links">
          <Link href="#apply">{d.hero.ctaPrimary}</Link>
          <Link href="#chapters">{d.hero.ctaSecondary}</Link>
        </div>

        <h2 id="chapters">{d.chapters.title}</h2>
        {d.chapters.items.map((c) => (
          <div key={c.name}>
            <h3>{c.name}</h3>
            <p className="mn-meta">{c.school}</p>
            <p>{c.focus}</p>
            <p>
              <strong>{d.chapters.leadsLabel}</strong> {c.leads}
            </p>
          </div>
        ))}

        <h2>{d.roles.title}</h2>
        <p>{d.roles.body}</p>
        <ul>
          {d.roles.items.map((r, i) => (
            <li key={r}>
              <strong>{r}</strong> {d.roles.hours.replace("{n}", String(ROLE_HOURS[i]))}
            </li>
          ))}
        </ul>

        <section id="apply">
          <h2>{d.form.title}</h2>
          <ApplyForm dict={d} />
        </section>

        <section id="contact">
          <h2>{d.contact.title}</h2>
          <p>{d.contact.body}</p>
          <ContactForm dict={d.contact} />
        </section>
      </div>
    </div>
  );
}
