import { MoonIcon, SunIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  selectTheme,
  selectToggleTheme,
  useShellStore,
} from "@/features/shell/stores/use-shell-store";

export function ThemeToggle() {
  const theme = useShellStore(selectTheme);
  const toggleTheme = useShellStore(selectToggleTheme);
  const isDark = theme === "dark";
  const label = isDark ? "라이트 테마로 변경" : "다크 테마로 변경";
  const ThemeIcon = isDark ? SunIcon : MoonIcon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-label={label}
          aria-pressed={isDark}
          size="icon"
          type="button"
          variant="ghost"
          onClick={toggleTheme}
        >
          <ThemeIcon aria-hidden="true" data-icon="inline-start" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  );
}
