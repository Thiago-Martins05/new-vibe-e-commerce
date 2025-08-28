import { NextRequest, NextResponse } from "next/server";

import { createOrder } from "@/actions/create-order";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    console.log("=== CRIAÇÃO DE PEDIDO ===");

    // Verificar variáveis de ambiente
    console.log("Verificando variáveis de ambiente...");
    console.log(
      "DATABASE_URL:",
      process.env.DATABASE_URL ? "Definida" : "Não definida",
    );
    console.log(
      "STRIPE_SECRET_KEY:",
      process.env.STRIPE_SECRET_KEY ? "Definida" : "Não definida",
    );
    console.log(
      "BETTER_AUTH_SECRET:",
      process.env.BETTER_AUTH_SECRET ? "Definida" : "Não definida",
    );

    const headersList = await request.headers;
    console.log(
      "Headers recebidos:",
      Object.fromEntries(headersList.entries()),
    );

    const session = await auth.api.getSession({ headers: headersList });

    if (!session?.user) {
      console.log("❌ Usuário não autenticado");
      return NextResponse.json(
        { message: "Usuário não autenticado" },
        { status: 401 },
      );
    }

    console.log("✅ Usuário autenticado:", session.user.email);

    const body = await request.json();
    const { sessionId } = body;

    console.log("SessionId recebido:", sessionId);

    if (!sessionId) {
      console.log("❌ sessionId não fornecido");
      return NextResponse.json(
        { message: "sessionId é obrigatório" },
        { status: 400 },
      );
    }

    console.log("Criando pedido para usuário:", session.user.id);
    const order = await createOrder(sessionId);
    console.log("✅ Pedido criado:", order);

    return NextResponse.json(order);
  } catch (error) {
    console.error("❌ Erro ao criar pedido:", error);
    return NextResponse.json(
      {
        message: "Erro interno do servidor",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    );
  }
}
