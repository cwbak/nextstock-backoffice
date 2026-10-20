import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Sector } from "@/data-access/schemas/sector";
import { sectorUiActions } from "@/features/sectors/stores/use-sector-ui-store";

export function SectorRowActions({ sector }: { sector: Sector }) {
  return (
    <div className="flex shrink-0 justify-end gap-1">
      {sector.depth !== "minor" ? (
        <Button
          aria-label={`${sector.name} 하위 섹터 추가`}
          size="icon-sm"
          title="하위 섹터 추가"
          type="button"
          variant="ghost"
          onClick={() => sectorUiActions.create(sector.id)}
        >
          <PlusIcon aria-hidden="true" data-icon="inline-start" />
        </Button>
      ) : null}
      <Button
        aria-label={`${sector.name} 섹터 수정`}
        size="icon-sm"
        title="수정"
        type="button"
        variant="ghost"
        onClick={() => sectorUiActions.edit(sector.id)}
      >
        <PencilIcon aria-hidden="true" data-icon="inline-start" />
      </Button>
      <Button
        aria-label={`${sector.name} 섹터 삭제`}
        size="icon-sm"
        title="삭제"
        type="button"
        variant="ghost"
        onClick={() => sectorUiActions.confirmDelete(sector.id)}
      >
        <Trash2Icon aria-hidden="true" data-icon="inline-start" />
      </Button>
    </div>
  );
}
