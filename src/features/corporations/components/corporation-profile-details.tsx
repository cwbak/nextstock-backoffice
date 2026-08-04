import type { ReactNode } from "react";

import { ExternalLinkIcon } from "lucide-react";

import type { Corporation } from "@/data-access/schemas/corporation";
import { formatDate } from "@/lib/format";

interface CorporationProfileFieldProps {
  children: ReactNode;
  className?: string;
  label: string;
}

function CorporationProfileField({
  children,
  className,
  label,
}: CorporationProfileFieldProps) {
  return (
    <div className={className}>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm leading-relaxed">{children}</dd>
    </div>
  );
}

function getWebsiteHref(value: string | null) {
  if (value === null) {
    return null;
  }

  const website = value.trim();

  if (website.length === 0) {
    return null;
  }

  const href = website.startsWith("//")
    ? `https:${website}`
    : /^[a-z][a-z\d+.-]*:/i.test(website)
      ? website
      : `https://${website}`;

  try {
    const url = new URL(href);

    return url.protocol === "http:" || url.protocol === "https:" ? href : null;
  } catch {
    return null;
  }
}

export function CorporationProfileDetails({
  corporation,
}: {
  corporation: Corporation;
}) {
  const websiteHref = getWebsiteHref(corporation.hmUrl);

  return (
    <dl
      aria-label="기업 기본 정보"
      className="grid grid-cols-2 gap-x-5 gap-y-4 rounded-lg border bg-card p-4"
    >
      <CorporationProfileField label="대표자">
        {corporation.ceoNm}
      </CorporationProfileField>
      <CorporationProfileField label="결산월">
        {corporation.accMt}월
      </CorporationProfileField>
      <CorporationProfileField label="설립일">
        {formatDate(corporation.estDt)}
      </CorporationProfileField>
      <CorporationProfileField className="col-span-2" label="주소">
        {corporation.address}
      </CorporationProfileField>
      <CorporationProfileField className="col-span-2 min-w-0" label="홈페이지">
        {websiteHref ? (
          <a
            className="inline-flex max-w-full items-center gap-1 text-primary underline-offset-4 hover:underline"
            href={websiteHref}
            rel="noreferrer"
            target="_blank"
          >
            <span className="truncate">{corporation.hmUrl}</span>
            <ExternalLinkIcon
              aria-hidden="true"
              className="size-3.5 shrink-0"
            />
          </a>
        ) : (
          <span className="text-muted-foreground">
            {corporation.hmUrl || "등록되지 않음"}
          </span>
        )}
      </CorporationProfileField>
    </dl>
  );
}
