import { Separator } from "@/components/ui/separator";
import { AppBrand } from "@/features/shell/components/app-brand";
import { AppNavigation } from "@/features/shell/components/app-navigation";

export function AppSidebar() {
  return (
    <aside className="sticky top-0 hidden h-svh min-h-0 border-r bg-sidebar text-sidebar-foreground md:flex md:flex-col">
      <div className="flex h-16 shrink-0 items-center px-5">
        <AppBrand />
      </div>
      <Separator />
      <div className="flex min-h-0 flex-1 flex-col p-3 pt-5">
        <AppNavigation />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-px bg-sidebar-primary/60"
      />
    </aside>
  );
}
