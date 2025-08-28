"use server";

import { db } from "@/db";

export const getOrders = async (userId: string) => {
  try {
    console.log("=== GET ORDERS ACTION ===");
    console.log("Buscando pedidos para userId:", userId);

    if (!userId) {
      throw new Error("userId é obrigatório");
    }

    console.log("Buscando pedidos no banco...");
    const orders = await db.query.orderTable.findMany({
      where: (order, { eq }) => eq(order.userId, userId),
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
      orderBy: (order, { desc }) => [desc(order.createdAt)],
    });

    console.log("Pedidos encontrados na action:", orders.length);
    return orders;
  } catch (error) {
    console.error("Erro na action getOrders:", error);
    throw error;
  }
};
