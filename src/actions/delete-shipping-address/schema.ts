import { z } from "zod";

//receber o id do endereço que vai ser removido
export const deleteShippingAddressSchema = z.object({
  addressId: z.uuid(),
});
