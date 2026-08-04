import { apiRequest } from "@/data-access/api/client";
import {
  equityInvestmentBulkCreatePayloadSchema,
  equityInvestmentBulkCreateResultSchema,
  equityInvestmentCreatePayloadSchema,
  equityInvestmentCreateResultSchema,
  type EquityInvestmentBulkCreatePayload,
  type EquityInvestmentBulkCreateResult,
  type EquityInvestmentCreatePayload,
  type EquityInvestmentCreateResult,
} from "@/data-access/schemas/equity-investment";

export async function createEquityInvestments(
  payload: EquityInvestmentCreatePayload,
): Promise<EquityInvestmentCreateResult> {
  const parsedPayload = equityInvestmentCreatePayloadSchema.parse(payload);

  return apiRequest(
    "/admin/equity_investments",
    equityInvestmentCreateResultSchema,
    { method: "POST" },
    parsedPayload,
  );
}

export async function createAllEquityInvestments(
  payload: EquityInvestmentBulkCreatePayload,
): Promise<EquityInvestmentBulkCreateResult> {
  const parsedPayload = equityInvestmentBulkCreatePayloadSchema.parse(payload);

  return apiRequest(
    "/admin/equity_investments/all",
    equityInvestmentBulkCreateResultSchema,
    { method: "POST" },
    parsedPayload,
  );
}
