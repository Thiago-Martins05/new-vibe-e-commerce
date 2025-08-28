import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { cartItemTable, cartTable } from "@/db/schema";
import { SessionManager } from "@/lib/session";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    // Obter usuário da sessão
    const session = await SessionManager.getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { message: "Usuário não autenticado" },
        { status: 401 },
      );
    }

    console.log("✅ Usuário autenticado para limpar carrinho:", session.email);

    // Buscar o carrinho do usuário
    const cart = await db.query.cartTable.findFirst({
      where: (cart, { eq }) => eq(cart.userId, session.userId),
    });

    if (!cart) {
      return NextResponse.json(
        { message: "Carrinho não encontrado" },
        { status: 404 },
      );
    }

    // Limpar todos os itens do carrinho
    await db.delete(cartItemTable).where(eq(cartItemTable.cartId, cart.id));

    console.log("✅ Carrinho limpo com sucesso");
    return NextResponse.json({ message: "Carrinho limpo com sucesso" });
  } catch (error) {
    console.error("Error clearing cart:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
