import { z } from 'zod';
import { isoDateRegex } from './shared.model';

export const DeliveryPreferencesSchema = z.object({
  targetTime: z
    .string()
    .regex(isoDateRegex)
    .optional(),
  collect: z.any().optional(),
  shipping: z.any().optional(),
});
