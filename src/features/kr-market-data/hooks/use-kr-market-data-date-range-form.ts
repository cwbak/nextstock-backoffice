import { useForm } from "react-hook-form";

import {
  krMarketDataCreateAllPayloadSchema,
  type KrMarketDataCreateAllPayload,
} from "@/data-access/schemas/kr-market-data";

const defaultValues: KrMarketDataCreateAllPayload = { from: "", to: "" };
const fieldNames = new Set<keyof KrMarketDataCreateAllPayload>(["from", "to"]);

function isFieldName(
  value: PropertyKey,
): value is keyof KrMarketDataCreateAllPayload {
  return fieldNames.has(value as keyof KrMarketDataCreateAllPayload);
}

export function useKrMarketDataDateRangeForm() {
  const {
    clearErrors,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<KrMarketDataCreateAllPayload>({ defaultValues });

  const resetForm = () => {
    clearErrors();
    reset(defaultValues);
  };
  const createSubmit = (
    onSubmit: (payload: KrMarketDataCreateAllPayload) => void,
  ) =>
    handleSubmit((values) => {
      clearErrors();
      const result = krMarketDataCreateAllPayloadSchema.safeParse(values);

      if (!result.success) {
        for (const issue of result.error.issues) {
          const fieldName = issue.path[0];

          if (typeof fieldName !== "undefined" && isFieldName(fieldName)) {
            setError(fieldName, { message: issue.message });
          }
        }
        return;
      }

      onSubmit(result.data);
    });

  return { createSubmit, errors, register, resetForm };
}
