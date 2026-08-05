import { FileUpIcon, Globe2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface NasdaqInfoEmptyStateProps {
  onUpload: () => void;
}

export function NasdaqInfoEmptyState({ onUpload }: NasdaqInfoEmptyStateProps) {
  return (
    <Empty className="min-h-72 border-0">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Globe2Icon aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>등록된 나스닥 종목 정보가 없습니다</EmptyTitle>
        <EmptyDescription>
          Nasdaq Stock Screener CSV 파일을 업로드해 종목 정보를 등록하세요.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button type="button" onClick={onUpload}>
          <FileUpIcon aria-hidden="true" data-icon="inline-start" />
          CSV 업로드
        </Button>
      </EmptyContent>
    </Empty>
  );
}
