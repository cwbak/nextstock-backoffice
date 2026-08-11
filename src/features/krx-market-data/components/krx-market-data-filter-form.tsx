import { useEffect } from "react";

import { Controller, useForm } from "react-hook-form";
import { SearchIcon } from "lucide-react";

import { KrxStockCombobox } from "@/components/common/krx-stock-combobox";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import type { KrxStock } from "@/data-access/schemas/krx-stock";
import {
  krxMarketDataFilterSchema,
  type KrxMarketDataFilterValues,
} from "@/data-access/schemas/krx-market-data";
import { KrxMarketDataPeriodSelect } from "@/features/krx-market-data/components/krx-market-data-period-select";

interface KrxMarketDataFilterFormProps {
  appliedFilters: KrxMarketDataFilterValues | null;
  onSearch: (filters: KrxMarketDataFilterValues) => void;
  stocks: ReadonlyArray<KrxStock>;
}

const filterFieldNames = new Set<keyof KrxMarketDataFilterValues>([
  "stockCode",
  "period",
]);

function isFilterFieldName(
  value: PropertyKey,
): value is keyof KrxMarketDataFilterValues {
  return filterFieldNames.has(value as keyof KrxMarketDataFilterValues);
}

export function KrxMarketDataFilterForm({
  appliedFilters,
  onSearch,
  stocks,
}: KrxMarketDataFilterFormProps) {
  const {
    clearErrors,
    control,
    formState: { errors },
    handleSubmit,
    reset,
    setError,
  } = useForm<KrxMarketDataFilterValues>({
    defaultValues: {
      stockCode: "",
      period: "daily",
    },
  });

  useEffect(() => {
    if (appliedFilters) {
      reset(appliedFilters);
    }
  }, [appliedFilters, reset]);

  const submitForm = handleSubmit((values) => {
    clearErrors();
    const result = krxMarketDataFilterSchema.safeParse(values);

    if (!result.success) {
      for (const issue of result.error.issues) {
        const fieldName = issue.path[0];

        if (typeof fieldName !== "undefined" && isFilterFieldName(fieldName)) {
          setError(fieldName, { message: issue.message });
        }
      }
      return;
    }

    onSearch(result.data);
  });

  return (
    <form
      className="rounded-xl border bg-card p-4 shadow-xs"
      noValidate
      onSubmit={(event) => void submitForm(event)}
    >
      <div className="mb-4">
        <h2 className="font-semibold">조회 조건</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          선택한 종목과 주기를 현재 일자 기준으로 조회합니다.
        </p>
      </div>
      <FieldGroup className="grid grid-cols-1 items-start gap-4 sm:grid-cols-[minmax(16rem,1.5fr)_minmax(8rem,0.7fr)_auto]">
        <Field data-invalid={Boolean(errors.stockCode)}>
          <FieldLabel htmlFor="market-data-stock-code">KRX 종목</FieldLabel>
          <Controller
            control={control}
            name="stockCode"
            render={({ field }) => (
              <KrxStockCombobox
                aria-invalid={Boolean(errors.stockCode)}
                id="market-data-stock-code"
                stocks={stocks}
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />
          <FieldError errors={[errors.stockCode]} />
        </Field>
        <Field data-invalid={Boolean(errors.period)}>
          <FieldLabel htmlFor="market-data-period">캔들 주기</FieldLabel>
          <Controller
            control={control}
            name="period"
            render={({ field }) => (
              <KrxMarketDataPeriodSelect
                aria-invalid={Boolean(errors.period)}
                id="market-data-period"
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />
          <FieldError errors={[errors.period]} />
        </Field>
        <Field className="sm:pt-6">
          <Button className="w-full sm:w-auto" type="submit">
            <SearchIcon aria-hidden="true" data-icon="inline-start" />
            조회
          </Button>
          <FieldDescription className="sr-only">
            선택한 조건으로 KRX 캔들을 조회합니다.
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
