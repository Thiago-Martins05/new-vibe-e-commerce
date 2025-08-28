import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { SessionManager } from "@/lib/session";
import { db } from "@/db";
import { cartTable } from "@/db/schema";

export async function PATCH(request: NextRequest) {
  try {
    console.log("=== API CART UPDATE SHIPPING ADDRESS - INICIANDO ===");

    // Obter usuário da sessão
    const session = await SessionManager.getSessionFromRequest(request);

    if (!session) {
      console.log("❌ Sessão não encontrada");
      return NextResponse.json(
        { message: "Usuário não autenticado" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { shippingAddressId } = body;

    if (!shippingAddressId) {
      return NextResponse.json(
        { message: "ID do endereço de entrega é obrigatório" },
        { status: 400 },
      );
    }

    console.log("✅ Atualizando endereço de entrega do carrinho:", {
      shippingAddressId,
      userId: session.userId,
    });

    // Buscar carrinho do usuário
    const cart = await db.query.cartTable.findFirst({
      where: (cart, { eq }) => eq(cart.userId, session.userId),
    });

    if (!cart) {
      console.log("❌ Carrinho não encontrado para userId:", session.userId);
      return NextResponse.json(
        { message: "Carrinho não encontrado" },
        { status: 404 },
      );
    }

    // Atualizar endereço de entrega no carrinho
    await db
      .update(cartTable)
      .set({ shippingAddressId })
      .where(eq(cartTable.id, cart.id));

    console.log("✅ Endereço de entrega atualizado no carrinho");

    return NextResponse.json({
      success: true,
      message: "Endereço de entrega atualizado",
    });
  } catch (error) {
    console.error("❌ Erro ao atualizar endereço de entrega:", error);
    return NextResponse.json(
      {
        message: "Erro interno do servidor",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    );
  }
}
