"use server";

import { db } from "@/db";
import { cartTable } from "@/db/schema";

export const getCart = async (userId: string) => {
  if (!userId) {
    throw new Error("UserId é obrigatório");
  }

  const cart = await db.query.cartTable.findFirst({
    where: (cart, { eq }) => eq(cart.userId, userId),
    with: {
      items: {
        with: {
          productVariant: {
            with: {
              product: true,
            },
          },
        },
      },
    },
  });

  // Verificar se tem o cart e se não tiver já cria um
  if (!cart) {
    const [newCart] = await db
      .insert(cartTable)
      .values({
        userId,
      })
      .returning();
    return {
      ...newCart,
      items: [],
      totalPriceInCents: 0,
    };
  }

  return {
    ...cart,
    totalPriceInCents: cart.items.reduce(
      (acc, item) => acc + item.productVariant.priceInCents * item.quantity,
      0,
    ),
  };
};
