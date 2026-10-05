import type { HomePageDict } from "@/lib/i18n/dictionary";
import { ChecklistArt, CtaBand } from "../shared/CtaBand";

export function HomeCta({
  dict,
  ppiHref,
  documentsHref,
}: {
  dict: HomePageDict["cta"];
  ppiHref: string;
  documentsHref: string;
}) {
  return (
    <CtaBand
      title={dict.title}
      body={dict.body}
      primary={{ label: dict.primary, href: ppiHref }}
      secondary={{ label: dict.secondary, href: documentsHref }}
      art={<ChecklistArt />}
    />
  );
}
