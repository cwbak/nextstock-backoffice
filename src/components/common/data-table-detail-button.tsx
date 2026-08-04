interface DataTableDetailButtonProps {
  label: string;
  onClick: () => void;
  primaryText: string;
  secondaryText?: string;
}

export function DataTableDetailButton({
  label,
  onClick,
  primaryText,
  secondaryText,
}: DataTableDetailButtonProps) {
  return (
    <button
      aria-label={label}
      className="group flex w-full min-w-0 rounded-sm text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
    >
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-medium group-hover:underline group-hover:underline-offset-4">
          {primaryText}
        </span>
        {secondaryText ? (
          <span className="truncate text-xs text-muted-foreground">
            {secondaryText}
          </span>
        ) : null}
      </span>
    </button>
  );
}
