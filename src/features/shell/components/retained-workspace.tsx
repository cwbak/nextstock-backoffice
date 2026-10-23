import { Activity, Suspense, useState, type ReactNode } from "react";

import { ManagementPageLoading } from "@/components/common/management-page-loading";

interface RetainedWorkspaceProps {
  active: boolean;
  children: ReactNode;
  label: string;
  name: string;
}

export function RetainedWorkspace({
  active,
  children,
  label,
  name,
}: RetainedWorkspaceProps) {
  const [visited, setVisited] = useState(active);

  if (active && !visited) {
    setVisited(true);
  }

  if (!active && !visited) {
    return null;
  }

  return (
    <Activity mode={active ? "visible" : "hidden"} name={name}>
      <Suspense fallback={<ManagementPageLoading label={label} />}>
        {children}
      </Suspense>
    </Activity>
  );
}
