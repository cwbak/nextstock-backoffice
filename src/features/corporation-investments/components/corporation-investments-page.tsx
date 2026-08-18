import { useMemo, useState } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { DatabaseIcon, PlusIcon, RefreshCwIcon } from "lucide-react";

import { DataPageHeader } from "@/components/common/data-page-header";
import {
  DataPagination,
  DataTableToolbar,
} from "@/components/common/data-table-controls";
import { DataTableCard } from "@/components/common/data-table-card";
import { NoSearchResults } from "@/components/common/no-search-results";
import {
  type DataTableState,
  useDataTableState,
} from "@/components/common/use-data-table-state";
import { useDataTableFilterQuery } from "@/components/common/use-data-table-filter-query";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { corporationsQueryOptions } from "@/data-access/queries/corporations/queries";
import { equityInvestmentsQueryOptions } from "@/data-access/queries/equity-investments/queries";
import type {
  EquityInvestmentBulkCreateResult,
  EquityInvestmentCreateResult,
} from "@/data-access/schemas/equity-investment";
import { CorporationInvestmentCreateDialog } from "@/features/corporation-investments/components/corporation-investment-create-dialog";
import { CorporationInvestmentCreateSummary } from "@/features/corporation-investments/components/corporation-investment-create-summary";
import { CorporationInvestmentsBulkCreateDialog } from "@/features/corporation-investments/components/corporation-investments-bulk-create-dialog";
import { CorporationInvestmentsBulkCreateSummary } from "@/features/corporation-investments/components/corporation-investments-bulk-create-summary";
import { CorporationInvestmentsEmptyState } from "@/features/corporation-investments/components/corporation-investments-empty-state";
import { CorporationInvestmentsTable } from "@/features/corporation-investments/components/corporation-investments-table";

const pageSize = 50;
const initialTableState: DataTableState = {
  page: 1,
  q: "",
};

type CreateResult =
  | {
      scope: "single";
      value: EquityInvestmentCreateResult;
    }
  | {
      scope: "all";
      value: EquityInvestmentBulkCreateResult;
    };

export function CorporationInvestmentsPage() {
  const investmentsQuery = useSuspenseQuery(equityInvestmentsQueryOptions);
  const corporationsQuery = useSuspenseQuery(corporationsQueryOptions);
  const {
    state: tableState,
    updatePage,
    updateQuery,
  } = useDataTableState(initialTableState);
  const [filterQuery, updateFilterQuery] = useDataTableFilterQuery(
    tableState.q,
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [bulkCreateOpen, setBulkCreateOpen] = useState(false);
  const [createResult, setCreateResult] = useState<CreateResult | null>(null);
  const corporationsByCode = useMemo(
    () =>
      new Map(
        corporationsQuery.data.map((corporation) => [
          corporation.code,
          corporation,
        ]),
      ),
    [corporationsQuery.data],
  );
  const isFetching =
    investmentsQuery.isFetching || corporationsQuery.isFetching;
  const filteredInvestments = useMemo(() => {
    const query = filterQuery.trim().toLocaleLowerCase("ko-KR");

    if (!query) {
      return investmentsQuery.data;
    }

    return investmentsQuery.data.filter((investment) => {
      const corporation = corporationsByCode.get(investment.corpCode);

      return [
        investment.corpCode,
        corporation?.name ?? "",
        corporation?.nameEn ?? "",
        investment.invName,
        investment.invstmntPurps ?? "",
        investment.trmendBlceQotaRt ?? "",
        investment.bsnsYear.toString(),
        investment.status,
      ].some((value) => value.toLocaleLowerCase("ko-KR").includes(query));
    });
  }, [corporationsByCode, filterQuery, investmentsQuery.data]);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredInvestments.length / pageSize),
  );
  const currentPage = Math.min(tableState.page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const visibleInvestments = filteredInvestments.slice(
    startIndex,
    startIndex + pageSize,
  );

  const refresh = async () => {
    await Promise.all([
      investmentsQuery.refetch(),
      corporationsQuery.refetch(),
    ]);
  };

  return (
    <>
      <section className="flex flex-col gap-6">
        <DataPageHeader
          actions={
            <>
              <Button
                disabled={isFetching}
                type="button"
                variant="outline"
                onClick={() => void refresh()}
              >
                {isFetching ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <RefreshCwIcon aria-hidden="true" data-icon="inline-start" />
                )}
                새로고침
              </Button>
              <Button type="button" onClick={() => setCreateOpen(true)}>
                <PlusIcon aria-hidden="true" data-icon="inline-start" />
                법인별 추가
              </Button>
              <Button type="button" onClick={() => setBulkCreateOpen(true)}>
                <DatabaseIcon aria-hidden="true" data-icon="inline-start" />
                전체 법인 추가
              </Button>
            </>
          }
          description="확정된 지분투자를 조회하고 DART 정기보고서에서 검토용 DRAFT를 생성합니다."
          eyebrow="Equity investments"
          recordCount={investmentsQuery.data.length}
          title="출자현황"
        />
        {createResult?.scope === "single" ? (
          <CorporationInvestmentCreateSummary
            corporation={corporationsByCode.get(createResult.value.corpCode)}
            result={createResult.value}
            onClose={() => setCreateResult(null)}
          />
        ) : createResult ? (
          <CorporationInvestmentsBulkCreateSummary
            result={createResult.value}
            onClose={() => setCreateResult(null)}
          />
        ) : null}
        <DataTableToolbar
          label="출자현황 검색"
          placeholder="보유 법인, 투자 대상, 사업연도, 상태, 출자목적, 지분율 검색"
          query={tableState.q}
          onFilterChange={updateFilterQuery}
          onQueryChange={updateQuery}
        />
        <DataTableCard
          description="상태가 OK인 법인별 지분투자를 사업연도와 함께 표시합니다."
          recordCount={filteredInvestments.length}
          title="지분투자 원장"
        >
          {investmentsQuery.data.length === 0 ? (
            <CorporationInvestmentsEmptyState
              onCreate={() => setCreateOpen(true)}
            />
          ) : filteredInvestments.length === 0 ? (
            <NoSearchResults
              query={filterQuery}
              onClear={() => updateQuery("")}
            />
          ) : (
            <>
              <CorporationInvestmentsTable
                corporationsByCode={corporationsByCode}
                investments={visibleInvestments}
              />
              <DataPagination
                endRecord={Math.min(
                  startIndex + pageSize,
                  filteredInvestments.length,
                )}
                page={currentPage}
                startRecord={startIndex + 1}
                totalPages={totalPages}
                totalRecords={filteredInvestments.length}
                onPageChange={updatePage}
              />
            </>
          )}
        </DataTableCard>
      </section>
      <CorporationInvestmentCreateDialog
        corporations={corporationsQuery.data}
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(result) => {
          setCreateResult({ scope: "single", value: result });
          setCreateOpen(false);
        }}
      />
      <CorporationInvestmentsBulkCreateDialog
        corporationCount={corporationsQuery.data.length}
        open={bulkCreateOpen}
        onOpenChange={setBulkCreateOpen}
        onCreated={(result) => {
          setCreateResult({ scope: "all", value: result });
          setBulkCreateOpen(false);
        }}
      />
    </>
  );
}
