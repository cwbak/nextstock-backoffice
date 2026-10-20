import { Button } from "@/components/ui/button";
import type { SectorRow } from "@/features/sectors/sector-hierarchy";
import { sectorUiActions } from "@/features/sectors/stores/use-sector-ui-store";

export function SectorParentPathButton({ row }: { row: SectorRow }) {
  const path = row.ancestorIds.length
    ? row.path.slice(0, -1).join(" › ")
    : "최상위 섹터";

  return (
    <Button
      aria-label={`${row.sector.name} 상위 경로를 ALL에서 보기`}
      className="h-auto max-w-full justify-start px-0 py-1"
      title={`${path} · ALL에서 보기`}
      type="button"
      variant="link"
      onClick={() => sectorUiActions.openParentPath(row.ancestorIds)}
    >
      <span className="truncate">{path}</span>
    </Button>
  );
}
