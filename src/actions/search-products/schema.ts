import { z } from "zod";

export const searchProductsSchema = z.object({
  query: z.string().min(1, "Query é obrigatória"),
});

export type searchProductsSchema = z.infer<typeof searchProductsSchema>;
