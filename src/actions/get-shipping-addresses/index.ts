"use server";

import { db } from "@/db";

export const getShippingAddresses = async (userId: string) => {
  if (!userId) {
    throw new Error("UserId é obrigatório");
  }

  // Buscar os endereços de entrega do usuário
  const addresses = await db.query.shippingAddressTable.findMany({
    where: (shippingAddress, { eq }) => eq(shippingAddress.userId, userId),
    orderBy: (shippingAddress, { desc }) => [desc(shippingAddress.createdAt)],
  });

  return addresses;
};
