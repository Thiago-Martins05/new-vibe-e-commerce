"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { cartItemTable, cartTable } from "@/db/schema";

export const clearCart = async (userId: string) => {
  if (!userId) {
    throw new Error("userId é obrigatório");
  }

  const cart = await db.query.cartTable.findFirst({
    where: (cart, { eq }) => eq(cart.userId, userId),
  });

  if (!cart) {
    return; // Carrinho já não existe
  }

  // Deletar todos os itens do carrinho
  await db.delete(cartItemTable).where(eq(cartItemTable.cartId, cart.id));

  // Resetar o endereço de entrega
  await db
    .update(cartTable)
    .set({ shippingAddressId: null })
    .where(eq(cartTable.id, cart.id));
};
