"use server";

import { db } from "@/db";
import { orderItemTable, orderTable } from "@/db/schema";

export const createTestOrders = async (userId: string) => {
  try {
    console.log("createTestOrders called with userId:", userId);

    if (!userId) {
      throw new Error("userId é obrigatório");
    }

    // Buscar um endereço existente do usuário
    const userAddresses = await db.query.shippingAddressTable.findMany({
      where: (address, { eq }) => eq(address.userId, userId),
      limit: 1,
    });

    console.log("User addresses found:", userAddresses.length);

    if (userAddresses.length === 0) {
      throw new Error("Usuário não possui endereços cadastrados");
    }

    const shippingAddressId = userAddresses[0].id;
    console.log("Using shipping address:", shippingAddressId);

    // Buscar algumas variantes de produtos existentes
    const productVariants = await db.query.productVariantTable.findMany({
      with: {
        product: true,
      },
      limit: 3,
    });

    console.log("Product variants found:", productVariants.length);

    if (productVariants.length === 0) {
      throw new Error("Não há produtos cadastrados no sistema");
    }

    // Gerar números únicos para os pedidos
    const timestamp = Date.now();
    const orderNumber1 = String(timestamp).slice(-3);
    const orderNumber2 = String(timestamp + 1).slice(-3);
    const orderNumber3 = String(timestamp + 2).slice(-3);

    // Criar pedidos de exemplo
    const [order1] = await db
      .insert(orderTable)
      .values({
        userId,
        shippingAddressId,
        totalAmountInCents: 123900, // R$ 1.239,00
        status: "paid",
        orderNumber: orderNumber1,
        stripeSessionId: `cs_test_example_${timestamp}_1`,
      })
      .returning();

    console.log("Order 1 created:", order1.id);

    const [order2] = await db
      .insert(orderTable)
      .values({
        userId,
        shippingAddressId,
        totalAmountInCents: 98000, // R$ 980,00
        status: "paid",
        orderNumber: orderNumber2,
        stripeSessionId: `cs_test_example_${timestamp}_2`,
      })
      .returning();

    console.log("Order 2 created:", order2.id);

    const [order3] = await db
      .insert(orderTable)
      .values({
        userId,
        shippingAddressId,
        totalAmountInCents: 75000, // R$ 750,00
        status: "paid",
        orderNumber: orderNumber3,
        stripeSessionId: `cs_test_example_${timestamp}_3`,
      })
      .returning();

    console.log("Order 3 created:", order3.id);

    // Criar itens do pedido 1
    await db.insert(orderItemTable).values([
      {
        orderId: order1.id,
        productVariantId: productVariants[0].id,
        quantity: 1,
        priceInCents: productVariants[0].priceInCents,
      },
      {
        orderId: order1.id,
        productVariantId: productVariants[1].id,
        quantity: 1,
        priceInCents: productVariants[1].priceInCents,
      },
    ]);

    // Criar itens do pedido 2
    await db.insert(orderItemTable).values([
      {
        orderId: order2.id,
        productVariantId: productVariants[1].id,
        quantity: 2,
        priceInCents: productVariants[1].priceInCents,
      },
    ]);

    // Criar itens do pedido 3
    await db.insert(orderItemTable).values([
      {
        orderId: order3.id,
        productVariantId: productVariants[2].id,
        quantity: 1,
        priceInCents: productVariants[2].priceInCents,
      },
    ]);

    console.log("All order items created successfully");

    return {
      success: true,
      message: "Pedidos de teste criados com sucesso!",
      ordersCreated: 3,
      orderNumbers: [orderNumber1, orderNumber2, orderNumber3],
    };
  } catch (error) {
    console.error("Error in createTestOrders:", error);
    throw error;
  }
};
