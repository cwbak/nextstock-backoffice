import { cleanup, render, screen, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

import { corporationIndustryQueryOptions } from "@/data-access/queries/corporations/queries";
import type { Corporation } from "@/data-access/schemas/corporation";
import type { CorporationIndustry } from "@/data-access/schemas/corporation-industry";
import { CorporationDetailSheet } from "@/features/corporations/components/corporation-detail-sheet";

const corporation: Corporation = {
  accMt: 12,
  address: "경기도 수원시 영통구 삼성로 129",
  ceoNm: "한종희",
  code: "00126380",
  createdAt: "2026-07-25T10:00:00+09:00",
  estDt: "1969-01-13",
  hmUrl: "www.samsung.com/sec",
  indutyCode: "264",
  info: {
    product: ["반도체", "스마트폰", "가전"],
    summary: ["전자제품 제조", "글로벌 반도체 기업"],
  },
  name: "삼성전자",
  nameEn: "Samsung Electronics",
  updatedAt: "2026-07-26T11:00:00+09:00",
};

const industry: CorporationIndustry = {
  corporationCode: "00126380",
  indutyCode: "264",
  sections: [
    {
      code: "C",
      divisions: [
        {
          code: "26",
          groups: [
            {
              classes: [
                {
                  code: "2642",
                  name: "방송 및 무선 통신장비 제조업",
                  subclasses: [
                    {
                      code: "26422",
                      details: ["휴대전화기"],
                      name: "이동전화기 제조업",
                    },
                  ],
                },
              ],
              code: "264",
              name: "통신 및 방송장비 제조업",
            },
          ],
          name: "전자부품, 컴퓨터, 영상, 음향 및 통신장비 제조업",
        },
      ],
      name: "제조업",
    },
  ],
};

describe("CorporationDetailSheet", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("기본 정보와 info, 이름 중심의 업종 분류 트리를 함께 표시한다", () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: Number.POSITIVE_INFINITY,
        },
      },
    });
    queryClient.setQueryData(
      corporationIndustryQueryOptions(corporation.code).queryKey,
      industry,
    );

    render(
      <QueryClientProvider client={queryClient}>
        <CorporationDetailSheet
          corporation={corporation}
          open
          onOpenChange={vi.fn()}
        />
      </QueryClientProvider>,
    );

    expect(
      screen.getByRole("heading", { name: "삼성전자" }),
    ).toBeInTheDocument();
    const profile = screen.getByLabelText("기업 기본 정보");

    expect(within(profile).getByText("대표자")).toBeInTheDocument();
    expect(within(profile).getByText("한종희")).toBeInTheDocument();
    expect(
      screen.getByText("경기도 수원시 영통구 삼성로 129"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "www.samsung.com/sec" }),
    ).toHaveAttribute("href", "https://www.samsung.com/sec");
    expect(screen.getByText("전자제품 제조")).toBeInTheDocument();
    const productList = screen.getByRole("list", { name: "주요 제품 목록" });

    expect(within(productList).getAllByRole("listitem")).toHaveLength(3);
    expect(within(productList).getByText("반도체")).toBeInTheDocument();
    expect(
      screen.getByRole("list", { name: "업종 분류 트리" }),
    ).toBeInTheDocument();
    expect(screen.getByText("제조업")).toBeInTheDocument();
    expect(screen.getByText("이동전화기 제조업")).toBeInTheDocument();
    expect(screen.getByText("휴대전화기")).toBeInTheDocument();
    expect(screen.queryByText("대분류")).not.toBeInTheDocument();
    expect(screen.queryByText("26422")).not.toBeInTheDocument();
  });
});
