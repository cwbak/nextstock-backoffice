import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ManagementPageLoadingProps {
  label: string;
}

export function ManagementPageLoading({ label }: ManagementPageLoadingProps) {
  return (
    <section aria-busy="true" aria-label={`${label} 불러오는 중`}>
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-3 border-b pb-6">
          <Skeleton className="h-3 w-44" />
          <Skeleton className="h-10 w-72 max-w-full" />
          <Skeleton className="h-4 w-[32rem] max-w-full" />
        </header>
        <Card className="gap-0 py-0">
          <CardHeader className="border-b py-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-52" />
          </CardHeader>
          <CardContent className="flex flex-col gap-0 p-0">
            {Array.from({ length: 6 }, (_, index) => (
              <div
                className="grid grid-cols-[8rem_1fr_8rem] gap-4 border-b p-4 last:border-b-0"
                key={index}
              >
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-full max-w-64" />
                <Skeleton className="h-4 w-16 justify-self-end" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
