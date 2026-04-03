"use client";

import { Tag } from "@/components/ui";

type Study = {
  meta: string;
  title: string;
  body: string;
  rq?: string | null;
  tags: string[];
};

export function StudyCard({ study }: { study: Study }) {
  return (
    <div
      className="mb-[1.5px] p-10 transition-colors duration-200"
      style={{
        background: "var(--color-bg-surface)",
        border: "1px solid var(--color-border)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor =
          "var(--color-vivid)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor =
          "var(--color-border)";
      }}
    >
      <p
        className="text-[0.78rem] font-semibold mb-4"
        style={{ color: "var(--color-light)" }}
      >
        {study.meta}
      </p>
      <h3 className="text-[1.4rem] font-bold mb-3 leading-[1.2]">
        {study.title}
      </h3>
      <p className="text-base text-white/80 leading-[1.7] mb-4">{study.body}</p>
      {study.rq && (
        <p className="text-base text-white/80 leading-[1.7] mb-4">
          <strong className="text-white">Research questions:</strong> {study.rq}
        </p>
      )}
      <div className="mt-6 flex flex-wrap">
        {study.tags.map((t) => (
          <Tag key={t}>{t}</Tag>
        ))}
      </div>
    </div>
  );
}
