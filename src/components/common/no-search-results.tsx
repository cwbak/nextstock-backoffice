import { SearchXIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface NoSearchResultsProps {
  onClear: () => void;
  query: string;
}

export function NoSearchResults({ onClear, query }: NoSearchResultsProps) {
  return (
    <Empty className="min-h-72 border-0">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchXIcon aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>검색 결과가 없습니다</EmptyTitle>
        <EmptyDescription>
          “{query}”와 일치하는 레코드를 찾지 못했습니다.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button type="button" variant="outline" onClick={onClear}>
          검색 초기화
        </Button>
      </EmptyContent>
    </Empty>
  );
}
