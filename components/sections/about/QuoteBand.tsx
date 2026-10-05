export function QuoteBand({ text, cite }: { text: string; cite: string }) {
  return (
    <section>
      <div className="wrap">
        <figure className="quote">
          <blockquote>
            <p>{text}</p>
          </blockquote>
          <figcaption>
            <cite>{cite}</cite>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
