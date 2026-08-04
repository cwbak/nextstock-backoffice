import { z } from "zod";

import { corporationCodeSchema } from "@/data-access/schemas/corporation";

const industrySubclassSchema = z
  .object({
    code: z.string().min(1),
    name: z.string().min(1),
    details: z.array(z.string()),
  })
  .strict();

const industryClassSchema = z
  .object({
    code: z.string().min(1),
    name: z.string().min(1),
    subclasses: z.array(industrySubclassSchema),
  })
  .strict();

const industryGroupSchema = z
  .object({
    code: z.string().min(1),
    name: z.string().min(1),
    classes: z.array(industryClassSchema),
  })
  .strict();

const industryDivisionSchema = z
  .object({
    code: z.string().min(1),
    name: z.string().min(1),
    groups: z.array(industryGroupSchema),
  })
  .strict();

const industrySectionSchema = z
  .object({
    code: z.string().min(1),
    name: z.string().min(1),
    divisions: z.array(industryDivisionSchema),
  })
  .strict();

export const corporationIndustrySchema = z
  .object({
    corporationCode: corporationCodeSchema,
    indutyCode: z.string().regex(/^\d+$/),
    sections: z.array(industrySectionSchema),
  })
  .strict();

export type CorporationIndustry = z.infer<typeof corporationIndustrySchema>;
export type IndustrySection = z.infer<typeof industrySectionSchema>;
export type IndustryDivision = z.infer<typeof industryDivisionSchema>;
export type IndustryGroup = z.infer<typeof industryGroupSchema>;
export type IndustryClass = z.infer<typeof industryClassSchema>;
export type IndustrySubclass = z.infer<typeof industrySubclassSchema>;
