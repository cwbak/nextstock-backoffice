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
import { Input } from "@/components/ui/input";
import type { KrxStock } from "@/data-access/schemas/krx-stock";
import {
  krxMarketDataListParamsSchema,
  type KrxMarketDataListParams,
} from "@/data-access/schemas/krx-market-data";
import { KrxMarketDataPeriodSelect } from "@/features/krx-market-data/components/krx-market-data-period-select";

interface KrxMarketDataFilterFormProps {
  onSearch: (params: KrxMarketDataListParams) => void;
  stocks: ReadonlyArray<KrxStock>;
}

const filterFieldNames = new Set<keyof KrxMarketDataListParams>([
  "stockCode",
  "period",
  "from",
  "to",
]);

function isFilterFieldName(
  value: PropertyKey,
): value is keyof KrxMarketDataListParams {
  return filterFieldNames.has(value as keyof KrxMarketDataListParams);
}

export function KrxMarketDataFilterForm({
  onSearch,
  stocks,
}: KrxMarketDataFilterFormProps) {
  const {
    clearErrors,
    control,
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<KrxMarketDataListParams>({
    defaultValues: {
      stockCode: "",
      period: "daily",
      from: "",
      to: "",
    },
  });

  const submitForm = handleSubmit((values) => {
    clearErrors();
    const result = krxMarketDataListParamsSchema.safeParse(values);

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
          종목과 캔들 주기는 필수이며 날짜는 필요한 범위만 입력할 수 있습니다.
        </p>
      </div>
      <FieldGroup className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(16rem,1.5fr)_minmax(8rem,0.7fr)_minmax(10rem,1fr)_minmax(10rem,1fr)_auto]">
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
        <Field data-invalid={Boolean(errors.from)}>
          <FieldLabel htmlFor="market-data-from">시작일</FieldLabel>
          <Input
            aria-invalid={Boolean(errors.from)}
            id="market-data-from"
            type="date"
            {...register("from")}
          />
          <FieldError errors={[errors.from]} />
        </Field>
        <Field data-invalid={Boolean(errors.to)}>
          <FieldLabel htmlFor="market-data-to">종료일</FieldLabel>
          <Input
            aria-invalid={Boolean(errors.to)}
            id="market-data-to"
            type="date"
            {...register("to")}
          />
          <FieldError errors={[errors.to]} />
        </Field>
        <Field className="sm:col-span-2 lg:col-span-1 lg:pt-6">
          <Button className="w-full lg:w-auto" type="submit">
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
