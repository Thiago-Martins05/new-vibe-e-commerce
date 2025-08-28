import { db } from "./index";
import { orderItemTable,orderTable } from "./schema";

export const seedOrders = async (userId: string) => {
  // Criar pedidos de exemplo
  const [order1] = await db
    .insert(orderTable)
    .values({
      userId,
      shippingAddressId: "550e8400-e29b-41d4-a716-446655440000", // ID de exemplo
      totalAmountInCents: 123900, // R$ 1.239,00
      status: "paid",
      orderNumber: "001",
      stripeSessionId: "cs_test_example1",
    })
    .returning();

  const [order2] = await db
    .insert(orderTable)
    .values({
      userId,
      shippingAddressId: "550e8400-e29b-41d4-a716-446655440000", // ID de exemplo
      totalAmountInCents: 98000, // R$ 980,00
      status: "paid",
      orderNumber: "002",
      stripeSessionId: "cs_test_example2",
    })
    .returning();

  const [order3] = await db
    .insert(orderTable)
    .values({
      userId,
      shippingAddressId: "550e8400-e29b-41d4-a716-446655440000", // ID de exemplo
      totalAmountInCents: 75000, // R$ 750,00
      status: "paid",
      orderNumber: "003",
      stripeSessionId: "cs_test_example3",
    })
    .returning();

  // Criar itens do pedido 1
  await db.insert(orderItemTable).values([
    {
      orderId: order1.id,
      productVariantId: "550e8400-e29b-41d4-a716-446655440001", // ID de exemplo
      quantity: 1,
      priceInCents: 74900, // R$ 749,00
    },
    {
      orderId: order1.id,
      productVariantId: "550e8400-e29b-41d4-a716-446655440002", // ID de exemplo
      quantity: 1,
      priceInCents: 49000, // R$ 490,00
    },
  ]);

  // Criar itens do pedido 2
  await db.insert(orderItemTable).values([
    {
      orderId: order2.id,
      productVariantId: "550e8400-e29b-41d4-a716-446655440003", // ID de exemplo
      quantity: 2,
      priceInCents: 49000, // R$ 490,00 cada
    },
  ]);

  // Criar itens do pedido 3
  await db.insert(orderItemTable).values([
    {
      orderId: order3.id,
      productVariantId: "550e8400-e29b-41d4-a716-446655440004", // ID de exemplo
      quantity: 1,
      priceInCents: 75000, // R$ 750,00
    },
  ]);

  console.log("Pedidos de exemplo criados com sucesso!");
};
