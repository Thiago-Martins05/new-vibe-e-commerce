import { z } from "zod";

export const addProductToCartSchema = z.object({
  productVariantId: z
    .string()
    .uuid("ID da variante do produto deve ser um UUID válido"),
  quantity: z.number().min(1, "Quantidade deve ser pelo menos 1"),
});

export type addProductToCartSchema = z.infer<typeof addProductToCartSchema>;
