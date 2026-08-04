import type { ReactNode } from "react";

import { useQuery } from "@tanstack/react-query";
import {
  BoxesIcon,
  Building2Icon,
  CircleAlertIcon,
  FileTextIcon,
  NetworkIcon,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/data-access/api/client";
import { corporationIndustryQueryOptions } from "@/data-access/queries/corporations/queries";
import type {
  Corporation,
  CorporationInfo,
} from "@/data-access/schemas/corporation";
import { CorporationIndustryTree } from "@/features/corporations/components/corporation-industry-tree";
import { CorporationProfileDetails } from "@/features/corporations/components/corporation-profile-details";

interface DetailSectionProps {
  children: ReactNode;
  description: string;
  icon: ReactNode;
  title: string;
}

function DetailSection({
  children,
  description,
  icon,
  title,
}: DetailSectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          {icon}
        </div>
        <div>
          <h3 className="font-heading font-medium">{title}</h3>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      {children}
    </section>
  );
}

function InformationEmpty({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
      등록된 {label} 정보가 없습니다.
    </div>
  );
}

function CorporationInformation({ info }: { info: CorporationInfo | null }) {
  if (info === null) {
    return (
      <Empty className="min-h-44 border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Building2Icon aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>기업 부가 정보가 없습니다</EmptyTitle>
          <EmptyDescription>
            수정 화면에서 기업 요약과 주요 제품을 등록할 수 있습니다.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="grid gap-4">
      <DetailSection
        description="기업의 핵심 사업과 특징입니다."
        icon={<FileTextIcon aria-hidden="true" />}
        title="기업 요약"
      >
        {info.summary.length > 0 ? (
          <ul className="flex list-disc flex-col gap-2 rounded-lg border bg-card px-8 py-4 leading-relaxed">
            {info.summary.map((summary, index) => (
              <li key={`${summary}-${index}`}>{summary}</li>
            ))}
          </ul>
        ) : (
          <InformationEmpty label="기업 요약" />
        )}
      </DetailSection>
      <DetailSection
        description="기업이 생산하거나 제공하는 주요 제품입니다."
        icon={<BoxesIcon aria-hidden="true" />}
        title="주요 제품"
      >
        {info.product.length > 0 ? (
          <ul
            aria-label="주요 제품 목록"
            className="divide-y divide-border/70 rounded-lg bg-muted/40 px-4"
          >
            {info.product.map((product, index) => (
              <li
                className="flex items-start gap-3 py-3 leading-relaxed text-foreground"
                key={`${product}-${index}`}
              >
                <span
                  aria-hidden="true"
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/65"
                />
                <span>{product}</span>
              </li>
            ))}
          </ul>
        ) : (
          <InformationEmpty label="주요 제품" />
        )}
      </DetailSection>
    </div>
  );
}

function IndustryTreeSkeleton() {
  return (
    <div aria-label="업종 분류 불러오는 중" className="flex flex-col gap-3">
      <Skeleton className="h-20 w-full" />
      <div className="ml-7 flex flex-col gap-3 border-l pl-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  );
}

interface CorporationDetailSheetProps {
  corporation: Corporation;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export function CorporationDetailSheet({
  corporation,
  onOpenChange,
  open,
}: CorporationDetailSheetProps) {
  const industryQuery = useQuery(
    corporationIndustryQueryOptions(corporation.code),
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 overflow-hidden p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-2xl">
        <SheetHeader className="gap-2 px-5 py-5 pr-14">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="font-mono tabular-nums" variant="outline">
              {corporation.code}
            </Badge>
          </div>
          <SheetTitle className="text-xl">{corporation.name}</SheetTitle>
          <SheetDescription>
            {corporation.nameEn || "영문 법인명이 없습니다."}
          </SheetDescription>
        </SheetHeader>
        <Separator />
        <div className="flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto px-5 py-6">
          <DetailSection
            description="대표자와 주요 등록 정보입니다."
            icon={<Building2Icon aria-hidden="true" />}
            title="기업 기본 정보"
          >
            <CorporationProfileDetails corporation={corporation} />
          </DetailSection>
          <Separator />
          <CorporationInformation info={corporation.info} />
          <Separator />
          <DetailSection
            description="기업의 업종 분류 체계입니다."
            icon={<NetworkIcon aria-hidden="true" />}
            title="업종 분류"
          >
            {industryQuery.isPending ? <IndustryTreeSkeleton /> : null}
            {industryQuery.isError ? (
              <Alert variant="destructive">
                <CircleAlertIcon aria-hidden="true" />
                <AlertTitle>업종 분류를 불러오지 못했습니다</AlertTitle>
                <AlertDescription>
                  {getErrorMessage(industryQuery.error)}
                </AlertDescription>
              </Alert>
            ) : null}
            {industryQuery.data ? (
              <CorporationIndustryTree industry={industryQuery.data} />
            ) : null}
          </DetailSection>
        </div>
      </SheetContent>
    </Sheet>
  );
}
