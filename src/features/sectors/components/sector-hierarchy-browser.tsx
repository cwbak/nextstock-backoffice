import { useMemo, useRef } from "react";

import { SectorHierarchyColumn } from "@/features/sectors/components/sector-hierarchy-column";
import { getSectorBrowserColumns } from "@/features/sectors/sector-browser";
import type { SectorRow } from "@/features/sectors/sector-hierarchy";
import {
  sectorUiActions,
  useSectorUiStore,
} from "@/features/sectors/stores/use-sector-ui-store";

function revealColumn(
  container: HTMLDivElement | null,
  column: HTMLElement | null,
) {
  if (!container || !column) return;
  const bounds = container.getBoundingClientRect();
  const target = column.getBoundingClientRect();
  const left =
    target.left < bounds.left
      ? target.left - bounds.left
      : target.right > bounds.right
        ? target.right - bounds.right
        : 0;
  if (left) container.scrollBy({ left });
}

export function SectorHierarchyBrowser({
  rows,
  matches,
  query,
}: {
  rows: ReadonlyArray<SectorRow>;
  matches: ReadonlyArray<SectorRow>;
  query: string;
}) {
  const majorId = useSectorUiStore((state) => state.selectedMajorId);
  const middleId = useSectorUiStore((state) => state.selectedMiddleId);
  const selectedSectorId = useSectorUiStore((state) => state.selectedSectorId);
  const browserRef = useRef<HTMLDivElement>(null);
  const middleRef = useRef<HTMLElement>(null);
  const minorRef = useRef<HTMLElement>(null);
  const { major, majorRows, middle, middleRows, minorRows } = useMemo(
    () => getSectorBrowserColumns(rows, matches, majorId, middleId),
    [rows, matches, majorId, middleId],
  );
  const searching = query.trim().length > 0;
  return (
    <div
      aria-label="섹터 계층 탐색"
      className="snap-x snap-mandatory overflow-x-auto"
      ref={browserRef}
      role="region"
    >
      <div className="grid min-w-[54rem] grid-cols-3 divide-x">
        <SectorHierarchyColumn
          controls="sector-middle-list"
          depth="major"
          description="대분류를 선택해 중분류를 확인하세요."
          emptyTitle="등록된 대분류가 없습니다"
          emptyDescription="동기화로 분류 정보를 확인해 주세요."
          rows={majorRows}
          selectedId={major?.id ?? null}
          onSelect={(id) => {
            sectorUiActions.selectMajor(id);
            revealColumn(browserRef.current, middleRef.current);
          }}
        />
        <SectorHierarchyColumn
          columnRef={middleRef}
          controls="sector-minor-list"
          depth="middle"
          description={
            major ? `${major.name}의 중분류` : "대분류 선택 후 표시됩니다."
          }
          emptyTitle={
            !major
              ? "대분류를 선택하세요"
              : searching
                ? "검색에 일치하는 중분류가 없습니다"
                : "연결된 중분류가 없습니다"
          }
          emptyDescription={
            !major
              ? "왼쪽에서 대분류를 선택해 주세요."
              : "다른 대분류를 선택하거나 검색 조건을 확인해 주세요."
          }
          rows={middleRows}
          selectedId={middle?.id ?? null}
          onSelect={(id) => {
            sectorUiActions.selectMiddle(id);
            revealColumn(browserRef.current, minorRef.current);
          }}
        />
        <SectorHierarchyColumn
          columnRef={minorRef}
          controls="sector-stocks-panel"
          depth="minor"
          description={
            middle ? `${middle.name}의 소분류` : "중분류 선택 후 표시됩니다."
          }
          emptyTitle={
            !middle
              ? "중분류를 선택하세요"
              : searching
                ? "검색에 일치하는 소분류가 없습니다"
                : "연결된 소분류가 없습니다"
          }
          emptyDescription={
            !middle
              ? "가운데에서 중분류를 선택해 주세요."
              : "다른 중분류를 선택하거나 검색 조건을 확인해 주세요."
          }
          rows={minorRows}
          selectedId={selectedSectorId}
          onSelect={sectorUiActions.selectSector}
        />
      </div>
    </div>
  );
}
