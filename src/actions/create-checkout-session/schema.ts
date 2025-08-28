import { z } from "zod";

export const createCheckoutSessionSchema = z.object({
  shippingAddressId: z.string().uuid(),
});

export type CreateCheckoutSessionSchema = z.infer<
  typeof createCheckoutSessionSchema
>;

