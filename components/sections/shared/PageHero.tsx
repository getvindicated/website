import type { ReactNode } from "react";

// The tinted hero at the top of every inner page.
export function PageHero({
  title,
  body,
  className,
  centered,
  children,
  art,
}: {
  title: string;
  body?: ReactNode;
  className?: string;
  centered?: boolean;
  children?: ReactNode;
  // Optional picture beside the text; stacks under it on phones.
  art?: ReactNode;
}) {
  const text = (
    <>
      <h1>{title}</h1>
      {body && <p>{body}</p>}
      {children}
    </>
  );
  return (
    <div className={`phero${className ? ` ${className}` : ""}`}>
      {art ? (
        <div className="wrap phero-split">
          <div>{text}</div>
          {art}
        </div>
      ) : (
        <div className={`wrap${centered ? " center" : ""}`}>{text}</div>
      )}
    </div>
  );
}
