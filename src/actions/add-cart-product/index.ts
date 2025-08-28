"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { cartItemTable, cartTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import { addProductToCartSchema } from "./schema";

//como é uma server action tem que colocar o o use server

export const addProductToCart = async (data: addProductToCartSchema) => {
  //validar os dados com zod no Schema e se o dados estiverem ok, validar a sessão.
  addProductToCartSchema.parse(data); //com o parse se o data não for válido já vai lançar uma exceção

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  //Agora verificar se o produto existe, no caso se aquela rota existe. ex:produto/tenis
  const productVariant = await db.query.productVariantTable.findFirst({
    where: (productVariant, { eq }) =>
      eq(productVariant.id, data.productVariantId),
  });

  if (!productVariant) {
    throw new Error("Product variant not found");
  }

  //Verificar se o usuario já tem algum carrinho criado.
  const cart = await db.query.cartTable.findFirst({
    where: (cart, { eq }) => eq(cart.userId, session.user.id),
  });

  //E se não tiver um carrinho, quero criar um carrinho. Se já existia um carrinho vai pegar o id dele, e se não tinha vai pegar o id do carrinho que acabou de ser criado.
  let cartId = cart?.id;
  if (!cartId) {
    const [newCart] = await db
      .insert(cartTable)
      .values({ userId: session.user.id })
      .returning();
    cartId = newCart.id;
  }

  //Verificar se a variante do produto já existe no carrinho
  const cartItem = await db.query.cartItemTable.findFirst({
    where: (cartItem, { eq }) =>
      eq(cartItem.cartId, cartId) &&
      eq(cartItem.productVariantId, data.productVariantId),
  });

  //Se no id daquele carrinho já existir o id daquela variante do produto vai aumentar somente na quantidade do produto
  if (cartItem) {
    await db
      .update(cartItemTable)
      .set({
        quantity: cartItem.quantity + data.quantity,
      })
      .where(eq(cartItemTable.id, cartItem.id));
    return;
  }

  //No caso do produto não existir vai criar a variante do produto no carrinho.
  await db.insert(cartItemTable).values({
    cartId,
    productVariantId: data.productVariantId,
    quantity: data.quantity,
  });
};

//Pra validar o dados usar o Zod no schema
