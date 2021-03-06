import {
  CustomAttributesSchema,
  isoDateRegex,
  LineItemArticleSchema,
} from './shared.model';
import { z } from 'zod';

export const PickStatus = z.enum(['OPEN', 'IN_PROGRESS', 'CLOSED']);

export const PickLineItemSchema = z.object({
  article: LineItemArticleSchema,
  quantity: z.number().min(1),
  scannableCodes: z
    .string()
    .array()
    .optional(),
  customAttributes: CustomAttributesSchema.optional(),
  id: z.string(),
  picked: z.number().min(0),
  status: PickStatus,
  // substituteLineItems	[...]
});

export const DeliveryChannel = z.enum(['COLLECT', 'SHIPPING']);

export const PickJobDeliveryInformationSchema = z.object({
  targetTime: z.string().regex(isoDateRegex),
  channel: DeliveryChannel,
  details: z.any().optional(),
});

export const StrippedPickJobSchema = z.object({
  id: z.string(), // The id of this pickjob. It is generated during creation automatically and suits as the primary identifier of the described entity.
  orderRef: z.string().optional(), // The id of the order reference. The given ID has to be present in the system.
  version: z.number().nonnegative(),
  facilityRef: z.string().optional(),
  status: PickStatus,
  created: z.string().regex(isoDateRegex), // The date this order was created at the platform. This value is generated by the service.
  lastModified: z.string().regex(isoDateRegex), // The date this order was modified last. This value is generated by the service.
});

export const PickJobSchema = StrippedPickJobSchema.extend({
  orderDate: z.string().regex(isoDateRegex),
  tenantOrderId: z.string().optional(),
  facilityRef: z.string(),

  pickLineItems: PickLineItemSchema.array().nonempty(),
  deliveryinformation: PickJobDeliveryInformationSchema,
  customAttributes: CustomAttributesSchema.optional(),
  created: z
    .string()
    .regex(isoDateRegex)
    .optional(), // created by the system
  lastModified: z
    .string()
    .regex(isoDateRegex)
    .optional(), // created by the system
  shortId: z.string(), // created by the system
  anonymized: z.boolean().optional(),
});

export const StrippedPickJobsSchema = z.object({
  total: z.number(),
  pickjobs: StrippedPickJobSchema.array(),
});

export const ModificationAction = z.enum([
  'ModifyPickJob',
  'ModifyPickLineItem',
]);

const AbstractModificationActionSchema = z.object({
  action: ModificationAction,
});

export const ModifyPickJobActionSchema = AbstractModificationActionSchema.extend(
  {
    status: PickStatus,
  },
);

export const ModifyPickLineItemActionSchema = AbstractModificationActionSchema.extend(
  {
    id: z.string(),
    picked: z.number().nonnegative(),
    status: PickStatus,
    //  substituteLineItems
  },
);

export const PickingModificationActions = z.union([
  ModifyPickLineItemActionSchema,
  ModifyPickJobActionSchema,
]);

export const PickingPatchActionsSchema = z.object({
  version: z.number().nonnegative(),
  actions: PickingModificationActions.array().nonempty(),
});

export type PickingPatchActions = z.TypeOf<typeof PickingPatchActionsSchema>;
export type PickJob = z.TypeOf<typeof PickJobSchema>;
export type PickLineItem = z.TypeOf<typeof PickLineItemSchema>;
export type PickJobDeliveryInformation = z.TypeOf<
  typeof PickJobDeliveryInformationSchema
>;
export type StrippedPickJobs = z.TypeOf<typeof StrippedPickJobsSchema>;
