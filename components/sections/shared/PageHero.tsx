import type { ReactNode } from "react";

// The title block at the top of every inner page.
export function PageHero({
  title,
  body,
  children,
}: {
  title: string;
  body?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="phero">
      <div className="wrap">
        <h1>{title}</h1>
        {body && <p>{body}</p>}
        {children}
      </div>
    </div>
  );
}
