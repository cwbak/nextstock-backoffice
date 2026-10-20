import { useIsMutating, useQuery } from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { sectorKeys } from "@/data-access/queries/sectors/keys";
import { sectorQueryOptions } from "@/data-access/queries/sectors/queries";
import type { Sector } from "@/data-access/schemas/sector";
import { SectorForm } from "@/features/sectors/components/sector-form";
import {
  SectorLoadingState,
  SectorLoadError,
} from "@/features/sectors/components/sector-list-states";
import {
  sectorUiActions,
  useSectorUiStore,
} from "@/features/sectors/stores/use-sector-ui-store";

function SectorEditDialogBody({
  id,
  sectors,
}: {
  id: number;
  sectors: ReadonlyArray<Sector>;
}) {
  const detail = useQuery({
    ...sectorQueryOptions(id),
    refetchOnMount: "always",
    retry: false,
  });
  if (detail.isPending || (detail.isFetching && !detail.isFetchedAfterMount)) {
    return <SectorLoadingState label="섹터 정보 불러오는 중" />;
  }
  if (detail.isError) {
    return (
      <SectorLoadError
        error={detail.error}
        onRetry={() => void detail.refetch()}
      />
    );
  }
  return (
    <SectorForm
      editor={{ mode: "edit", id }}
      initialSector={detail.data}
      sectors={sectors}
    />
  );
}

export function SectorFormDialog({
  sectors,
}: {
  sectors: ReadonlyArray<Sector>;
}) {
  const editor = useSectorUiStore((state) => state.editor);
  const isSaving = useIsMutating({ mutationKey: sectorKeys.writes() }) > 0;
  return (
    <Dialog
      open={editor !== null}
      onOpenChange={(open) => {
        if (!open && !isSaving) sectorUiActions.closeEditor();
      }}
    >
      <DialogContent
        className="max-h-[calc(100svh-2rem)] overflow-y-auto sm:max-w-lg"
        onEscapeKeyDown={(event) => {
          if (isSaving) event.preventDefault();
        }}
        onInteractOutside={(event) => {
          if (isSaving) event.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {editor?.mode === "edit" ? "섹터 수정" : "섹터 추가"}
          </DialogTitle>
          <DialogDescription>
            {editor?.mode === "edit"
              ? `섹터 #${editor.id}의 이름, 분류와 상위 관계를 변경합니다.`
              : "Toss 섹터 ID, 이름, 분류와 상위 관계를 지정합니다."}
          </DialogDescription>
        </DialogHeader>
        {editor ? (
          editor.mode === "edit" ? (
            <SectorEditDialogBody
              id={editor.id}
              key={editor.id}
              sectors={sectors}
            />
          ) : (
            <SectorForm
              editor={editor}
              initialSector={undefined}
              key={`create-${editor.parentId ?? "root"}`}
              sectors={sectors}
            />
          )
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
