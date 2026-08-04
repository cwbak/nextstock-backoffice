import { CircleAlertIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface MutationErrorAlertProps {
  message: string;
}

export function MutationErrorAlert({ message }: MutationErrorAlertProps) {
  return (
    <Alert variant="destructive">
      <CircleAlertIcon aria-hidden="true" />
      <AlertTitle>저장하지 못했습니다</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
