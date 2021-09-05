import { CustomAttributesSchema } from './shared.model';
import { z } from 'zod';

export const ConsumerAddressSchema = z.object({
  street: z.string().regex(/^.+$/),
  houseNumber: z.string().regex(/^.+$/),
  postalCode: z.string().regex(/^.+$/),
  city: z.string().regex(/^.+$/),
  country: z.string().regex(/^[A-Z]{2}$/), // A two-digit country code as per ISO 3166-1 alpha-2
  phoneNumbers: z
    .any()
    .array()
    .optional(),
  additionalAddressInfo: z.string().optional(),
  customAttributes: CustomAttributesSchema.optional(),
  salutation: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string(),
  companyName: z.string().optional(),
});

export const ConsumerSchema = z.object({
  email: z.string().email(),
  addresses: ConsumerAddressSchema.array(),
  customAttributes: CustomAttributesSchema.optional(),
});

export type Consumer = z.TypeOf<typeof ConsumerSchema>;
export type ConsumerAddress = z.TypeOf<typeof ConsumerAddressSchema>;
