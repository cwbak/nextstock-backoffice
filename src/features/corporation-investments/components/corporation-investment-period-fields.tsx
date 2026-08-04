import type {
  FieldError as ReactHookFormFieldError,
  UseFormRegisterReturn,
} from "react-hook-form";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const reportOptions = [
  { label: "1분기보고서", value: 1 },
  { label: "반기보고서", value: 2 },
  { label: "3분기보고서", value: 3 },
  { label: "사업보고서", value: 4 },
] as const;

interface CorporationInvestmentPeriodFieldsProps {
  businessYearError: ReactHookFormFieldError | undefined;
  businessYearRegistration: UseFormRegisterReturn<"bsnsYear">;
  idPrefix: string;
  onReportCodeChange: (value: number) => void;
  reportCode: number;
  reportCodeError: ReactHookFormFieldError | undefined;
}

export function CorporationInvestmentPeriodFields({
  businessYearError,
  businessYearRegistration,
  idPrefix,
  onReportCodeChange,
  reportCode,
  reportCodeError,
}: CorporationInvestmentPeriodFieldsProps) {
  return (
    <>
      <Field data-invalid={Boolean(businessYearError)}>
        <FieldLabel htmlFor={`${idPrefix}-business-year`}>사업연도</FieldLabel>
        <Input
          {...businessYearRegistration}
          aria-invalid={Boolean(businessYearError)}
          id={`${idPrefix}-business-year`}
          inputMode="numeric"
          maxLength={4}
          placeholder="2025"
        />
        <FieldDescription>숫자 4자리</FieldDescription>
        <FieldError errors={[businessYearError]} />
      </Field>
      <Field data-invalid={Boolean(reportCodeError)}>
        <FieldLabel htmlFor={`${idPrefix}-report-code`}>보고서 구분</FieldLabel>
        <Select
          value={String(reportCode)}
          onValueChange={(value) => onReportCodeChange(Number(value))}
        >
          <SelectTrigger
            aria-invalid={Boolean(reportCodeError)}
            className="w-full"
            id={`${idPrefix}-report-code`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {reportOptions.map((option) => (
                <SelectItem key={option.value} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <FieldDescription>DART 정기보고서 기준</FieldDescription>
        <FieldError errors={[reportCodeError]} />
      </Field>
    </>
  );
}
