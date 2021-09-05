import { z } from 'zod';

export const ItemCategory = z.enum([
  'descriptive',
  'miscellaneous',
  'pickingSequence',
]);

export const CustomAttributesSchema = z.object({
  description: z.string().optional(),
});

export const ArticleAttributeItemSchema = z.object({
  category: ItemCategory.optional(),
  priority: z
    .number()
    .min(1)
    .max(1000)
    .optional(),
  key: z.string().min(1),
  value: z.string().min(1),
});

export const LineItemArticleSchema = z.object({
  tenantArticleId: z.string(),
  title: z.string(),
  imageUrl: z.string().optional(),
  customAttributes: CustomAttributesSchema.optional(),
  attributes: ArticleAttributeItemSchema.array(),
});

export const isoDateRegex = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)((-(\d{2}):(\d{2})|Z)?)$/;

export type LineItemArticle = z.TypeOf<typeof LineItemArticleSchema>;
