import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  CalendarEvent,
  CalendarEventImportance,
  CalendarEventType,
} from "@/data-access/schemas/calendar-event";
import { formatDate, formatDateTime } from "@/lib/format";

const eventTypeLabels: Record<CalendarEventType, string> = {
  EARNINGS: "실적",
  INDICATOR: "경제지표",
};

const importancePresentation: Record<
  CalendarEventImportance,
  { dotClassName: string; label: string }
> = {
  low: {
    dotClassName: "bg-slate-400",
    label: "낮음",
  },
  medium: {
    dotClassName: "bg-amber-500",
    label: "보통",
  },
  high: {
    dotClassName: "bg-red-500",
    label: "높음",
  },
};

interface CalendarEventsTableProps {
  items: ReadonlyArray<CalendarEvent>;
}

export function CalendarEventsTable({ items }: CalendarEventsTableProps) {
  return (
    <Table className="min-w-[88rem] table-fixed">
      <TableCaption className="sr-only">등록된 캘린더 일정</TableCaption>
      <colgroup>
        <col className="w-20" />
        <col className="w-36" />
        <col className="w-40" />
        <col className="w-24" />
        <col className="w-28" />
        <col className="w-24" />
        <col className="w-80" />
        <col className="w-44" />
        <col className="w-44" />
      </colgroup>
      <TableHeader>
        <TableRow className="bg-muted/35 hover:bg-muted/35">
          <TableHead className="pl-4">ID</TableHead>
          <TableHead>날짜</TableHead>
          <TableHead>시간</TableHead>
          <TableHead>국가</TableHead>
          <TableHead>유형</TableHead>
          <TableHead>중요도</TableHead>
          <TableHead>일정</TableHead>
          <TableHead>생성일</TableHead>
          <TableHead className="pr-4">최종 수정</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => {
          const importance = importancePresentation[item.importance];

          return (
            <TableRow key={item.id}>
              <TableCell className="pl-4 font-mono text-xs tabular-nums text-muted-foreground">
                {item.id}
              </TableCell>
              <TableCell className="font-medium tabular-nums">
                {formatDate(item.eventDate)}
              </TableCell>
              <TableCell>
                <span className="block font-mono text-xs tabular-nums">
                  {item.eventTime ?? "종일"}
                </span>
                {item.timezone ? (
                  <span
                    className="mt-1 block truncate text-xs text-muted-foreground"
                    title={item.timezone}
                  >
                    {item.timezone}
                  </span>
                ) : null}
              </TableCell>
              <TableCell className="font-mono text-xs font-medium">
                {item.countryCode}
              </TableCell>
              <TableCell>{eventTypeLabels[item.eventType]}</TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={`size-1.5 rounded-full ${importance.dotClassName}`}
                  />
                  {importance.label}
                </span>
              </TableCell>
              <TableCell className="overflow-hidden whitespace-normal">
                <span className="block font-medium">{item.title}</span>
                {item.titleEn ? (
                  <span
                    className="mt-1 block truncate text-xs text-muted-foreground"
                    title={item.titleEn}
                  >
                    {item.titleEn}
                  </span>
                ) : null}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDateTime(item.createdAt)}
              </TableCell>
              <TableCell className="pr-4 text-muted-foreground">
                {formatDateTime(item.updatedAt)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
