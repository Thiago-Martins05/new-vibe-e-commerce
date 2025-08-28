import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { orderTable } from "@/db/schema";
import { SessionManager } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    console.log("=== BUSCANDO PEDIDOS ===");

    // Obter usuário da sessão
    const session = await SessionManager.getSessionFromRequest(request);

    if (!session) {
      console.log("❌ Usuário não autenticado");
      return NextResponse.json(
        { message: "Usuário não autenticado" },
        { status: 401 },
      );
    }

    console.log("✅ Usuário autenticado:", session.email);

    // Buscar pedidos usando o userId
    const orders = await db.query.orderTable.findMany({
      where: (order, { eq }) => eq(order.userId, session.userId),
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

    console.log("✅ Pedidos encontrados:", orders.length);
    return NextResponse.json(orders);
  } catch (error) {
    console.error("❌ Erro ao buscar pedidos:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
