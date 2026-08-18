import { apiRequest } from "@/data-access/api/client";
import {
  equityInvestmentsAllJobRegistrationSchema,
  type BackgroundJobRegistration,
} from "@/data-access/schemas/background-job";
import {
  equityInvestmentBulkCreatePayloadSchema,
  equityInvestmentCreatePayloadSchema,
  equityInvestmentCreateResultSchema,
  type EquityInvestmentBulkCreatePayload,
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
): Promise<BackgroundJobRegistration> {
  const parsedPayload = equityInvestmentBulkCreatePayloadSchema.parse(payload);

  return apiRequest(
    "/admin/equity_investments/all",
    equityInvestmentsAllJobRegistrationSchema,
    { method: "POST" },
    parsedPayload,
  );
}
