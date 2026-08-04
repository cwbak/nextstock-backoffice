import { useMutation, useQueryClient } from "@tanstack/react-query";

import { DeleteConfirmationDialog } from "@/components/common/delete-confirmation-dialog";
import { getErrorMessage } from "@/data-access/api/client";
import { corporationKeys } from "@/data-access/queries/corporations/keys";
import { deleteCorporation } from "@/data-access/queries/corporations/mutations";
import type { Corporation } from "@/data-access/schemas/corporation";

interface CorporationDeleteDialogProps {
  corporation: Corporation | null;
  onClose: () => void;
}

export function CorporationDeleteDialog({
  corporation,
  onClose,
}: CorporationDeleteDialogProps) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deleteCorporation,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: corporationKeys.all,
      });
      onClose();
    },
  });

  return (
    <DeleteConfirmationDialog
      description={
        corporation
          ? `${corporation.name} (${corporation.code}) 법인을 삭제합니다. 연결된 상장 종목이 있으면 삭제할 수 없습니다.`
          : ""
      }
      errorMessage={
        mutation.isError ? getErrorMessage(mutation.error) : undefined
      }
      isPending={mutation.isPending}
      open={corporation !== null}
      title="법인을 삭제할까요?"
      onConfirm={() => {
        if (corporation) {
          mutation.mutate(corporation.code);
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
