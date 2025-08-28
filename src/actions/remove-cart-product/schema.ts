import { z } from "zod";

//receber o id do produto que vai se removido do carrinho.
export const removeProductFromCartSchema = z.object({
  cartItemId: z.uuid(),
});
