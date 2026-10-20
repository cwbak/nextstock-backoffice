import { ToggleGroup } from "radix-ui";

import { Button } from "@/components/ui/button";
import { sectorViewSchema } from "@/features/sectors/sector-browser";
import {
  sectorUiActions,
  useSectorUiStore,
} from "@/features/sectors/stores/use-sector-ui-store";

const viewLabels = {
  all: "ALL",
  major: "major",
  middle: "middle",
  minor: "minor",
};

export function SectorViewSwitch() {
  const view = useSectorUiStore((state) => state.browserView);
  return (
    <ToggleGroup.Root
      aria-label="섹터 보기"
      className="flex items-center gap-1 rounded-lg border bg-background p-1"
      type="single"
      value={view}
      onValueChange={(value) => {
        const result = sectorViewSchema.safeParse(value);
        if (result.success) sectorUiActions.setBrowserView(result.data);
      }}
    >
      {sectorViewSchema.options.map((value) => (
        <ToggleGroup.Item asChild key={value} value={value}>
          <Button
            size="sm"
            type="button"
            variant={view === value ? "secondary" : "ghost"}
          >
            {viewLabels[value]}
          </Button>
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}
