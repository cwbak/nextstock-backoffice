import { Link } from "@tanstack/react-router";

import { navigationItems } from "@/features/shell/navigation-items";

interface AppNavigationProps {
  onNavigate?: () => void;
}

export function AppNavigation({ onNavigate }: AppNavigationProps) {
  return (
    <nav aria-label="주 메뉴" className="flex min-h-0 flex-1 flex-col">
      <p className="px-3 pb-2 font-mono text-[0.625rem] tracking-[0.16em] text-sidebar-foreground/45 uppercase">
        Reference data
      </p>
      <ul className="flex flex-col gap-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;

          return (
            <li key={item.to}>
              <Link
                activeOptions={{ exact: true }}
                activeProps={{
                  "aria-current": "page",
                  className:
                    "bg-sidebar-accent text-sidebar-accent-foreground before:bg-sidebar-primary",
                }}
                className="relative flex min-h-10 items-center gap-3 rounded-md px-3 text-sm font-medium outline-none transition-colors before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-transparent hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring motion-reduce:transition-none"
                inactiveProps={{
                  className: "text-sidebar-foreground/65",
                }}
                to={item.to}
                onClick={onNavigate}
              >
                <Icon aria-hidden="true" className="size-4.5" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
