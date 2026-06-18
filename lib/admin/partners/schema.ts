import { z } from "zod";

export const partnerStatusSchema = z.enum(["active", "paused", "inactive"]);
export const partnerAssignmentTypeSchema = z.enum([
  "sale",
  "consignment",
  "sample",
]);

export const createPartnerSchema = z.object({
  name: z.string().trim().min(2).max(160),
  contactPerson: z.string().trim().max(160).optional().default(""),
  email: z.string().trim().email().max(160).optional().or(z.literal("")).default(""),
  phone: z.string().trim().max(80).optional().default(""),
  city: z.string().trim().max(120).optional().default(""),
  nip: z.string().trim().max(20).optional().default(""),
  notes: z.string().trim().max(2000).optional().default(""),
});

export const updatePartnerSchema = createPartnerSchema.extend({
  status: partnerStatusSchema,
});

export const createPartnerAssignmentSchema = z.object({
  lotId: z.string().uuid(),
  quantityAssigned: z.coerce.number().int().positive(),
  unitPriceGross: z.coerce.number().nonnegative().optional(),
  assignmentType: partnerAssignmentTypeSchema.default("sale"),
  notes: z.string().trim().max(2000).optional().default(""),
});

export const deletePartnerAssignmentSchema = z.object({
  partnerId: z.string().uuid(),
  assignmentId: z.string().uuid(),
});

export type PartnerStatus = z.infer<typeof partnerStatusSchema>;
export type PartnerAssignmentType = z.infer<typeof partnerAssignmentTypeSchema>;
export type CreatePartnerInput = z.infer<typeof createPartnerSchema>;
export type UpdatePartnerInput = z.infer<typeof updatePartnerSchema>;
export type CreatePartnerAssignmentInput = z.infer<
  typeof createPartnerAssignmentSchema
>;

export type DeletePartnerAssignmentInput = z.infer<
  typeof deletePartnerAssignmentSchema
>;
