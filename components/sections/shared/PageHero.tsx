import type { ReactNode } from "react";

// The title block at the top of every inner page.
export function PageHero({
  title,
  body,
  className,
  centered,
  children,
}: {
  title: string;
  body?: ReactNode;
  className?: string;
  centered?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className={`phero${className ? ` ${className}` : ""}`}>
      <div className={`wrap${centered ? " center" : ""}`}>
        <h1>{title}</h1>
        {body && <p>{body}</p>}
        {children}
      </div>
    </div>
  );
}
