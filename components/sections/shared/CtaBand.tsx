import Link from "next/link";

type CtaLink = { label: string; href: string };

// The purple call-to-action card that closes most redesigned pages.
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
    <section>
      <div className="wrap">
        <div className="cta">
          <div>
            <h2>{title}</h2>
            <p>{body}</p>
            <div className="ctas">
              <Link className="btn btn-white" href={primary.href}>
                {primary.label}
              </Link>
              {secondary && (
                <Link className="btn btn-ghost-white" href={secondary.href}>
                  {secondary.label}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
