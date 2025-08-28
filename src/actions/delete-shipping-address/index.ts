"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod";

import { db } from "@/db";
import { shippingAddressTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import { deleteShippingAddressSchema } from "./schema";

export const deleteShippingAddress = async (
  data: z.infer<typeof deleteShippingAddressSchema>,
) => {
  //validar os dados com zod no Schema e se o dados estiverem ok, validar a sessão.
  deleteShippingAddressSchema.parse(data);
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  //Verificar se o endereço existe e pertence ao usuário logado
  const address = await db.query.shippingAddressTable.findFirst({
    where: (address, { eq, and }) =>
      and(eq(address.id, data.addressId), eq(address.userId, session.user.id)),
  });

  if (!address) {
    throw new Error("Address not found or unauthorized");
  }

  await db
    .delete(shippingAddressTable)
    .where(eq(shippingAddressTable.id, data.addressId));
};
