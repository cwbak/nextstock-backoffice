import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import { getErrorMessage } from "@/data-access/api/client";
import { themeKeys } from "@/data-access/queries/themes/keys";
import {
  prepareThemeSync,
  synchronizeThemes,
  ThemeSyncPreflightError,
} from "@/data-access/queries/themes/sync";
import {
  getThemeSyncChangeCount,
  isThemeSyncBlocked,
  type ThemeSyncAssessment,
} from "@/data-access/queries/themes/sync-plan";
import {
  parseThemeSyncJson,
  type ThemeSyncInput,
} from "@/data-access/schemas/theme-sync";
import { themeSyncActions } from "@/features/themes/stores/use-theme-sync-store";

export function useThemeSync() {
  const queryClient = useQueryClient();
  const form = useForm<{ json: string }>({ defaultValues: { json: "" } });
  const inspection = useMutation({
    mutationFn: (input: ThemeSyncInput) => prepareThemeSync(input, queryClient),
    retry: false,
    onMutate: () =>
      themeSyncActions.setProgress({
        stage: "checking",
        completed: 0,
        total: 0,
      }),
    onSettled: () => themeSyncActions.setProgress(null),
  });
  const execution = useMutation({
    mutationFn: (preview: ThemeSyncAssessment) =>
      synchronizeThemes(preview, queryClient, themeSyncActions.setProgress),
    retry: false,
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: themeKeys.all });
      themeSyncActions.setProgress(null);
    },
  });
  const assessment =
    execution.error instanceof ThemeSyncPreflightError
      ? execution.error.assessment
      : inspection.data;
  const isBusy = inspection.isPending || execution.isPending;
  const canExecute =
    assessment !== undefined &&
    !isThemeSyncBlocked(assessment) &&
    getThemeSyncChangeCount(assessment) > 0 &&
    !execution.isError &&
    !execution.isSuccess &&
    !isBusy;

  const inspect = form.handleSubmit(({ json }) => {
    form.clearErrors();
    inspection.reset();
    execution.reset();
    try {
      inspection.mutate(parseThemeSyncJson(json));
    } catch (error) {
      form.setError("json", { message: getErrorMessage(error) });
    }
  });

  const registration = form.register("json", {
    onChange: () => {
      inspection.reset();
      execution.reset();
      form.clearErrors();
    },
  });

  return {
    assessment,
    canExecute,
    execution,
    inspection,
    inspect,
    isBusy,
    jsonError: form.formState.errors.json,
    registration,
    execute: () => {
      if (canExecute && assessment) {
        execution.mutate(assessment);
      }
    },
  };
}
