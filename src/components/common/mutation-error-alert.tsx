import { CircleAlertIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface MutationErrorAlertProps {
  message: string;
  title?: string;
}

export function MutationErrorAlert({
  message,
  title = "저장하지 못했습니다",
}: MutationErrorAlertProps) {
  return (
    <Alert variant="destructive">
      <CircleAlertIcon aria-hidden="true" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
