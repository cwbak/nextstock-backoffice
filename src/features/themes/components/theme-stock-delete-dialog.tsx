import { useMutation, useQueryClient } from "@tanstack/react-query";

import { DeleteConfirmationDialog } from "@/components/common/delete-confirmation-dialog";
import { getErrorMessage } from "@/data-access/api/client";
import { themeKeys } from "@/data-access/queries/themes/keys";
import { deleteThemeStock } from "@/data-access/queries/themes/mutations";
import type { KrStock } from "@/data-access/schemas/kr-stock";
import type { Theme } from "@/data-access/schemas/theme";

interface ThemeStockDeleteDialogProps {
  onClose: () => void;
  stock: KrStock | null;
  theme: Theme | null;
}

export function ThemeStockDeleteDialog({
  onClose,
  stock,
  theme,
}: ThemeStockDeleteDialogProps) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deleteThemeStock,
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: themeKeys.stocks(variables.themeId),
      });
      onClose();
    },
  });
  const open = stock !== null && theme !== null;

  return (
    <DeleteConfirmationDialog
      description={
        open
          ? `${stock.name} (${stock.code}) 기업을 ${theme.name} 테마에서 삭제합니다. KR 종목과 법인 정보는 유지됩니다.`
          : ""
      }
      errorMessage={
        mutation.isError ? getErrorMessage(mutation.error) : undefined
      }
      isPending={mutation.isPending}
      open={open}
      title="테마에서 기업을 삭제할까요?"
      onConfirm={() => {
        if (open) {
          mutation.mutate({ stockCode: stock.code, themeId: theme.id });
        }
      }}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !mutation.isPending) {
          mutation.reset();
          onClose();
        }
      }}
    />
  );
}
