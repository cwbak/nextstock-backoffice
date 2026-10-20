import { useMutation, useQueryClient } from "@tanstack/react-query";

import { DeleteConfirmationDialog } from "@/components/common/delete-confirmation-dialog";
import { getErrorMessage } from "@/data-access/api/client";
import { sectorKeys } from "@/data-access/queries/sectors/keys";
import { deleteSector } from "@/data-access/queries/sectors/mutations";
import type { Sector } from "@/data-access/schemas/sector";
import { getSectorBranchIds } from "@/features/sectors/sector-hierarchy";
import {
  sectorUiActions,
  useSectorUiStore,
} from "@/features/sectors/stores/use-sector-ui-store";

function SectorDeleteConfirmation({
  sector,
  sectors,
}: {
  sector: Sector;
  sectors: ReadonlyArray<Sector>;
}) {
  const queryClient = useQueryClient();
  const branchIds = getSectorBranchIds(sectors, sector.id);
  const mutation = useMutation({
    mutationKey: sectorKeys.writes(),
    mutationFn: () => deleteSector(sector.id),
    onSuccess: async () => {
      for (const id of branchIds) {
        queryClient.removeQueries({
          queryKey: sectorKeys.detail(id),
          exact: true,
        });
        await queryClient.cancelQueries({ queryKey: sectorKeys.stocks(id) });
        queryClient.removeQueries({ queryKey: sectorKeys.stocks(id) });
      }
      await queryClient.invalidateQueries({ queryKey: sectorKeys.lists() });
      sectorUiActions.closeDelete();
    },
  });
  return (
    <DeleteConfirmationDialog
      description={`“${sector.name}”과 모든 하위 섹터가 함께 삭제됩니다. 현재 목록 기준 하위 ${branchIds.size - 1}개를 포함해 총 ${branchIds.size}개이며, 삭제 후에는 되돌릴 수 없습니다.`}
      errorMessage={
        mutation.isError ? getErrorMessage(mutation.error) : undefined
      }
      isPending={mutation.isPending}
      onConfirm={() => mutation.mutate()}
      onOpenChange={(open) => {
        if (!open && !mutation.isPending) sectorUiActions.closeDelete();
      }}
      open
      title="섹터를 삭제할까요?"
    />
  );
}

export function SectorDeleteDialog({
  sectors,
}: {
  sectors: ReadonlyArray<Sector>;
}) {
  const deletingId = useSectorUiStore((state) => state.deletingId);
  const sector = sectors.find((item) => item.id === deletingId);
  return sector ? (
    <SectorDeleteConfirmation
      key={sector.id}
      sector={sector}
      sectors={sectors}
    />
  ) : null;
}
