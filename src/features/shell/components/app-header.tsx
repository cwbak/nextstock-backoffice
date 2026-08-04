import { MobileNavigation } from "@/features/shell/components/mobile-navigation";
import { ThemeToggle } from "@/features/shell/components/theme-toggle";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b bg-background px-3 sm:px-5 md:justify-end">
      <MobileNavigation />
      <ThemeToggle />
    </header>
  );
}
