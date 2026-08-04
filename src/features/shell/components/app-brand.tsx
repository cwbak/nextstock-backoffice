import { Link } from "@tanstack/react-router";

interface AppBrandProps {
  onNavigate?: () => void;
}

export function AppBrand({ onNavigate }: AppBrandProps) {
  return (
    <Link
      aria-label="stock-note admin 홈"
      className="flex min-w-0 items-center gap-3 rounded-md outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-sidebar-ring motion-reduce:transition-none"
      to="/corporations"
      onClick={onNavigate}
    >
      <span
        aria-hidden="true"
        className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-md bg-sidebar-primary font-mono text-[0.7rem] font-semibold tracking-tight text-sidebar-primary-foreground"
      >
        <span className="absolute inset-y-0 left-1.5 w-px bg-sidebar-primary-foreground/35" />
        SN
      </span>
      <span className="flex min-w-0 flex-col">
        <span
          className="truncate text-sm font-semibold tracking-[-0.02em]"
          translate="no"
        >
          stock-note
        </span>
        <span
          className="font-mono text-[0.625rem] tracking-[0.18em] text-sidebar-foreground/55 uppercase"
          translate="no"
        >
          Admin desk
        </span>
      </span>
    </Link>
  );
}
