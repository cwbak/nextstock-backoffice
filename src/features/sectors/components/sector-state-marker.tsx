import { cn } from "@/lib/utils";

const markerDescriptions = {
  leaf: {
    label: "말단 섹터",
    title:
      "말단 섹터 (isLeaf): 마지막 동기화에서 하위 섹터가 없고 연결 종목이 있습니다.",
  },
  empty: {
    label: "빈 섹터",
    title:
      "빈 섹터 (isEmpty): 마지막 동기화에서 자신과 모든 하위 섹터에 연결된 종목이 없습니다.",
  },
};

export function SectorStateMarker({ state }: { state: "leaf" | "empty" }) {
  const description = markerDescriptions[state];
  return (
    <span
      aria-label={description.label}
      className={cn(
        "size-2.5 shrink-0 rounded-full",
        state === "empty"
          ? "border-2 border-primary"
          : "bg-primary ring-2 ring-primary/25",
      )}
      role="img"
      title={description.title}
    />
  );
}
