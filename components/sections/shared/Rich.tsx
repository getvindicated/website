import { Fragment } from "react";

// Dictionary rich text: plain strings plus { "b": "..." } for bold runs.
export type RichText = readonly (string | { b: string })[];

export function Rich({ text }: { text: RichText }) {
  return (
    <>
      {text.map((seg, i) =>
        typeof seg === "string" ? (
          <Fragment key={i}>{seg}</Fragment>
        ) : (
          <strong key={i}>{seg.b}</strong>
        ),
      )}
    </>
  );
}
