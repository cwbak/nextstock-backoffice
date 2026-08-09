import { useMutation, useQueryClient } from "@tanstack/react-query";

import { DeleteConfirmationDialog } from "@/components/common/delete-confirmation-dialog";
import { getErrorMessage } from "@/data-access/api/client";
import { krxStockKeys } from "@/data-access/queries/krx-stocks/keys";
import { deleteKrxStock } from "@/data-access/queries/krx-stocks/mutations";
import type { KrxStock } from "@/data-access/schemas/krx-stock";

interface KrxStockDeleteDialogProps {
  krxStock: KrxStock | null;
  onClose: () => void;
}

export function KrxStockDeleteDialog({
  krxStock,
  onClose,
}: KrxStockDeleteDialogProps) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deleteKrxStock,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: krxStockKeys.all,
      });
      onClose();
    },
  });

  return (
    <DeleteConfirmationDialog
      description={
        krxStock
          ? `${krxStock.name} (${krxStock.code}) 종목을 삭제합니다. 이 작업은 되돌릴 수 없습니다.`
          : ""
      }
      errorMessage={
        mutation.isError ? getErrorMessage(mutation.error) : undefined
      }
      isPending={mutation.isPending}
      open={krxStock !== null}
      title="상장 종목을 삭제할까요?"
      onConfirm={() => {
        if (krxStock) {
          mutation.mutate(krxStock.code);
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
