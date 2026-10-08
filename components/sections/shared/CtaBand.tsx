import Link from "next/link";

type CtaLink = { label: string; href: string };

// The closing call to action on most pages: a heading, a line of text,
// and a button or two.
export function CtaBand({
  title,
  body,
  primary,
  secondary,
}: {
  title: string;
  body: string;
  primary: CtaLink;
  secondary?: CtaLink;
}) {
  return (
    <section className="cta">
      <div className="wrap">
        <h2 className="h2">{title}</h2>
        <p className="lede">{body}</p>
        <div className="ctas">
          <Link className="btn btn-solid" href={primary.href}>
            {primary.label}
          </Link>
          {secondary && (
            <Link className="btn btn-line" href={secondary.href}>
              {secondary.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
