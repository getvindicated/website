import type { HomePageDict } from "@/lib/i18n/dictionary";
import { CtaBand } from "../shared/CtaBand";

export function HomeCta({
  dict,
  ppiHref,
}: {
  dict: HomePageDict["cta"];
  ppiHref: string;
}) {
  return (
    <CtaBand
      title={dict.title}
      body={dict.body}
      primary={{ label: dict.primary, href: ppiHref }}
    />
  );
}
