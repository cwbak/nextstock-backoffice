import { useMutation, useQueryClient } from "@tanstack/react-query";

import { DeleteConfirmationDialog } from "@/components/common/delete-confirmation-dialog";
import { getErrorMessage } from "@/data-access/api/client";
import { listedStockKeys } from "@/data-access/queries/listed-stocks/keys";
import { deleteListedStock } from "@/data-access/queries/listed-stocks/mutations";
import type { ListedStock } from "@/data-access/schemas/listed-stock";

interface ListedStockDeleteDialogProps {
  listedStock: ListedStock | null;
  onClose: () => void;
}

export function ListedStockDeleteDialog({
  listedStock,
  onClose,
}: ListedStockDeleteDialogProps) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deleteListedStock,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: listedStockKeys.all,
      });
      onClose();
    },
  });

  return (
    <DeleteConfirmationDialog
      description={
        listedStock
          ? `${listedStock.name} (${listedStock.code}) 종목을 삭제합니다. 이 작업은 되돌릴 수 없습니다.`
          : ""
      }
      errorMessage={
        mutation.isError ? getErrorMessage(mutation.error) : undefined
      }
      isPending={mutation.isPending}
      open={listedStock !== null}
      title="상장 종목을 삭제할까요?"
      onConfirm={() => {
        if (listedStock) {
          mutation.mutate(listedStock.code);
        }
      }}
      onOpenChange={(open) => {
        if (!open && !mutation.isPending) {
          mutation.reset();
          onClose();
        }
      }}
    />
  );
}
