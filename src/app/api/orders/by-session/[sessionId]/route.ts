import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { orderTable } from "@/db/schema";
import { SessionManager } from "@/lib/session";

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } },
) {
  try {
    const { sessionId } = params;

    if (!sessionId) {
      return NextResponse.json(
        { message: "SessionId é obrigatório" },
        { status: 400 },
      );
    }

    // Buscar o pedido pelo sessionId do Stripe
    const order = await db.query.orderTable.findFirst({
      where: (order, { eq }) => eq(order.stripeSessionId, sessionId),
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
        shippingAddress: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { message: "Pedido não encontrado" },
        { status: 404 },
      );
    }

    // Verificar se o usuário está autenticado e se o pedido pertence a ele
    const session = await SessionManager.getSessionFromRequest(request);

    if (session && session.userId !== order.userId) {
      return NextResponse.json({ message: "Acesso negado" }, { status: 403 });
    }

    // Retornar dados do pedido
    const orderData = {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalInCents: order.totalAmountInCents,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        priceInCents: item.priceInCents,
        productVariant: {
          name: item.productVariant.name,
          imageUrl: item.productVariant.imageUrl,
          product: {
            name: item.productVariant.product.name,
          },
        },
      })),
      shippingAddress: order.shippingAddress,
    };

    return NextResponse.json(orderData);
  } catch (error) {
    console.error("Error getting order by session:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
