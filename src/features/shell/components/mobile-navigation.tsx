import { MenuIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { AppBrand } from "@/features/shell/components/app-brand";
import { AppNavigation } from "@/features/shell/components/app-navigation";
import {
  selectMobileNavigationOpen,
  selectSetMobileNavigationOpen,
  useShellStore,
} from "@/features/shell/stores/use-shell-store";

export function MobileNavigation() {
  const open = useShellStore(selectMobileNavigationOpen);
  const setOpen = useShellStore(selectSetMobileNavigationOpen);
  const closeNavigation = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        aria-label="주 메뉴 열기"
        className="md:hidden"
        size="icon"
        type="button"
        variant="ghost"
        onClick={() => setOpen(true)}
      >
        <MenuIcon aria-hidden="true" data-icon="inline-start" />
      </Button>
      <SheetContent
        className="w-[min(19rem,86vw)] gap-0 overscroll-contain p-0 sm:max-w-[19rem]"
        showCloseButton={false}
        side="left"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>주 메뉴</SheetTitle>
          <SheetDescription>관리자 페이지 메뉴를 선택합니다.</SheetDescription>
        </SheetHeader>
        <SheetClose asChild>
          <Button
            aria-label="주 메뉴 닫기"
            className="absolute top-3 right-3"
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <XIcon aria-hidden="true" data-icon="inline-start" />
          </Button>
        </SheetClose>
        <div className="flex h-16 shrink-0 items-center px-5">
          <AppBrand onNavigate={closeNavigation} />
        </div>
        <Separator />
        <div className="flex min-h-0 flex-1 flex-col p-3 pt-5">
          <AppNavigation onNavigate={closeNavigation} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
