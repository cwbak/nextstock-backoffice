import { useState, type FocusEventHandler, type Ref } from "react";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { parseKrStockAliasesInput } from "@/features/kr-stocks/kr-stock-aliases";

const aliasesFieldDescriptions = {
  append: "한 줄에 하나씩 입력합니다. 기존 종목이면 현재 별칭에 추가합니다.",
  replace:
    "한 줄에 하나씩 입력합니다. 저장하면 기존 별칭 목록을 교체하며, 모두 지우면 별칭을 삭제합니다.",
} as const;

interface KrStockAliasesFieldProps {
  errorMessage: string | undefined;
  id: string;
  inputRef: Ref<HTMLTextAreaElement>;
  mode: keyof typeof aliasesFieldDescriptions;
  name: string;
  value: ReadonlyArray<string> | undefined;
  onBlur: FocusEventHandler<HTMLTextAreaElement>;
  onValueChange: (value: Array<string> | undefined) => void;
}

export function KrStockAliasesField({
  errorMessage,
  id,
  inputRef,
  mode,
  name,
  value,
  onBlur,
  onValueChange,
}: KrStockAliasesFieldProps) {
  const [inputValue, setInputValue] = useState(() => value?.join("\n") ?? "");

  return (
    <Field className="sm:col-span-2" data-invalid={Boolean(errorMessage)}>
      <FieldLabel htmlFor={id}>종목명 별칭 (선택)</FieldLabel>
      <Textarea
        aria-invalid={Boolean(errorMessage)}
        id={id}
        name={name}
        placeholder={"삼전\n삼성전자 보통주"}
        ref={inputRef}
        rows={3}
        value={inputValue}
        onBlur={onBlur}
        onChange={(event) => {
          const nextInputValue = event.currentTarget.value;
          const aliases = parseKrStockAliasesInput(nextInputValue);

          setInputValue(nextInputValue);
          onValueChange(aliases ?? (mode === "replace" ? [] : undefined));
        }}
      />
      <FieldDescription>{aliasesFieldDescriptions[mode]}</FieldDescription>
      <FieldError>{errorMessage}</FieldError>
    </Field>
  );
}
