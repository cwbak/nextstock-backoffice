import { useMutation, useQueryClient } from "@tanstack/react-query";

import { DeleteConfirmationDialog } from "@/components/common/delete-confirmation-dialog";
import { getErrorMessage } from "@/data-access/api/client";
import { krStockKeys } from "@/data-access/queries/kr-stocks/keys";
import { deleteKrStock } from "@/data-access/queries/kr-stocks/mutations";
import type { KrStock } from "@/data-access/schemas/kr-stock";

interface KrStockDeleteDialogProps {
  krStock: KrStock | null;
  onClose: () => void;
}

export function KrStockDeleteDialog({
  krStock,
  onClose,
}: KrStockDeleteDialogProps) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deleteKrStock,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: krStockKeys.all,
      });
      onClose();
    },
  });

  return (
    <DeleteConfirmationDialog
      description={
        krStock
          ? `${krStock.name} (${krStock.code}) 종목을 삭제합니다. 이 작업은 되돌릴 수 없습니다.`
          : ""
      }
      errorMessage={
        mutation.isError ? getErrorMessage(mutation.error) : undefined
      }
      isPending={mutation.isPending}
      open={krStock !== null}
      title="상장 종목을 삭제할까요?"
      onConfirm={() => {
        if (krStock) {
          mutation.mutate(krStock.code);
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
