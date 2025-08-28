import { z } from "zod";

export const increaseCartProductQuantitySchema = z.object({
  cartItemId: z.uuid(),
});

export type increaseCartProductQuantitySchema = z.infer<
  typeof increaseCartProductQuantitySchema
>;
