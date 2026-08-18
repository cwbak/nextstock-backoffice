import { z } from "zod";

export const backgroundJobTypeSchema = z.enum([
  "corporations_sync",
  "equity_investments_all",
  "kr_stocks_kis_daily",
  "kr_stocks_sync",
]);

export const backgroundJobStatusSchema = z.enum([
  "QUEUED",
  "RUNNING",
  "COMPLETED",
  "FAILED",
]);

const backgroundJobProgressSchema = z
  .object({
    current: z.number().int().nonnegative(),
    total: z.number().int().nonnegative().nullable(),
    percent: z.number().min(0).max(100).nullable(),
    succeeded: z.number().int().nonnegative(),
    failed: z.number().int().nonnegative(),
  })
  .strict();

const objectValueSchema = z.record(z.string(), z.unknown());

export const backgroundJobSchema = z
  .object({
    jobId: z.number().int().positive(),
    type: backgroundJobTypeSchema,
    status: backgroundJobStatusSchema,
    stage: z.string().nullable(),
    parameters: objectValueSchema,
    progress: backgroundJobProgressSchema,
    result: objectValueSchema.nullable(),
    error: z.string().nullable(),
    attemptCount: z.number().int().nonnegative(),
    createdAt: z.iso.datetime({ offset: true }),
    startedAt: z.iso.datetime({ offset: true }).nullable(),
    finishedAt: z.iso.datetime({ offset: true }).nullable(),
    updatedAt: z.iso.datetime({ offset: true }),
  })
  .strict();

export const backgroundJobListSchema = z
  .object({
    jobs: z.array(backgroundJobSchema),
  })
  .strict();

export const backgroundJobRegistrationSchema = z
  .object({
    jobId: z.number().int().positive(),
    type: backgroundJobTypeSchema,
    status: z.enum(["QUEUED", "RUNNING"]),
    statusUrl: z.string().regex(/^\/admin\/jobs\/\d+$/),
    created: z.boolean(),
    createdAt: z.iso.datetime({ offset: true }),
  })
  .strict();

export const corporationsSyncJobRegistrationSchema =
  backgroundJobRegistrationSchema.extend({
    type: z.literal("corporations_sync"),
  });

export const equityInvestmentsAllJobRegistrationSchema =
  backgroundJobRegistrationSchema.extend({
    type: z.literal("equity_investments_all"),
  });

export const krStocksSyncJobRegistrationSchema =
  backgroundJobRegistrationSchema.extend({
    type: z.literal("kr_stocks_sync"),
  });

export const krStocksKisDailyJobRegistrationSchema =
  backgroundJobRegistrationSchema.extend({
    type: z.literal("kr_stocks_kis_daily"),
  });

export type BackgroundJob = z.infer<typeof backgroundJobSchema>;
export type BackgroundJobRegistration = z.infer<
  typeof backgroundJobRegistrationSchema
>;
export type BackgroundJobType = z.infer<typeof backgroundJobTypeSchema>;
