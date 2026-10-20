import type { Sector } from "@/data-access/schemas/sector";

export function SectorName({
  sector,
}: {
  sector: Pick<Sector, "name" | "isLeaf">;
}) {
  return (
    <span className="flex min-w-0 max-w-full items-center gap-2 text-left">
      {sector.isLeaf ? (
        <span
          aria-label="말단 섹터"
          className="size-2.5 shrink-0 rounded-full bg-primary ring-2 ring-primary/25"
          role="img"
          title="말단 섹터 (isLeaf): 마지막 동기화에서 하위 섹터가 없고 연결 종목이 있습니다."
        />
      ) : null}
      <span className="truncate" title={sector.name}>
        {sector.name}
      </span>
    </span>
  );
}
