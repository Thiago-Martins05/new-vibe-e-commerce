"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod";

import { db } from "@/db";
import { cartItemTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import { decreaseCartProductQuantitySchema } from "./schema";

//como é uma server action tem que colocar o o use server

export const decreaseCartProductQuantity = async (
  data: z.infer<typeof decreaseCartProductQuantitySchema>,
) => {
  //validar os dados com zod no Schema e se o dados estiverem ok, validar a sessão.
  decreaseCartProductQuantitySchema.parse(data); //com o parse se o data não for válido já vai lançar uma exceção
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Não precisa verificar se o usuario já tem um carrinho, pois se ele tiver o cartItemid ele já vai ter um carrinho.

  //Verificar se a variante do produto já existe no carrinho
  const cartItem = await db.query.cartItemTable.findFirst({
    where: (cartItem, { eq }) => eq(cartItem.id, data.cartItemId),
    with: {
      cart: true,
    },
  });

  //Se não tiver este cart item significa que estou tentando deletar um item que não esta no carrinho.
  if (!cartItem) {
    throw new Error("Cart item not found");
  }

  // Para que caso o carrinho na qual este item pertence,  não for o do usuário logado, não permitir que delete o item.
  const cartDoesNotBelongToUser = cartItem.cart.userId !== session.user.id;
  if (cartDoesNotBelongToUser) {
    throw new Error("Unauthorized");
  }

  //Se a quantidade for igual a 1, tem que deletar ele
  if (cartItem.quantity === 1) {
    await db.delete(cartItemTable).where(eq(cartItemTable.id, cartItem.id));
    return;
  }

  await db
    .update(cartItemTable)
    .set({ quantity: cartItem.quantity - 1 })
    .where(eq(cartItemTable.id, cartItem.id));
};

//Pra validar o dados usar o Zod no schema
