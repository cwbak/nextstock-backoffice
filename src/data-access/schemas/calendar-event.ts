import { z } from "zod";

export const calendarEventTypeSchema = z.enum(["EARNINGS", "INDICATOR"]);
export const calendarEventImportanceSchema = z.enum(["low", "medium", "high"]);

export const calendarEventSchema = z
  .object({
    id: z.number().int().positive(),
    eventDate: z.iso.date(),
    countryCode: z.string().length(2),
    eventType: calendarEventTypeSchema,
    title: z.string().min(1),
    titleEn: z.string().min(1).nullable(),
    eventTime: z
      .string()
      .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
      .nullable(),
    timezone: z.string().min(1).nullable(),
    importance: calendarEventImportanceSchema,
    createdAt: z.iso.datetime({ offset: true }),
    updatedAt: z.iso.datetime({ offset: true }),
  })
  .strict();

export const calendarEventListSchema = z.array(calendarEventSchema);

export type CalendarEvent = z.infer<typeof calendarEventSchema>;
export type CalendarEventType = z.infer<typeof calendarEventTypeSchema>;
export type CalendarEventImportance = z.infer<
  typeof calendarEventImportanceSchema
>;
