import { NextRequest, NextResponse } from "next/server";

import { createCheckoutSession } from "@/actions/create-checkout-session";
import { SessionManager } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Obter usuário da sessão
    const session = await SessionManager.getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { message: "Usuário não autenticado" },
        { status: 401 },
      );
    }

    console.log("✅ Usuário autenticado:", session.email);

    const result = await createCheckoutSession({
      ...body,
      userId: session.userId,
    });
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Error creating checkout session:", error);

    let status = 500;
    let message = "Erro interno do servidor";

    if (error instanceof Error) {
      if (error.message.includes("Usuário não autenticado")) {
        status = 401;
        message = "Usuário não autenticado";
      } else if (error.message.includes("Carrinho vazio")) {
        status = 400;
        message = "Carrinho vazio";
      } else if (error.message.includes("Configuração de pagamento")) {
        status = 500;
        message = "Erro na configuração de pagamento";
      } else if (error.message.includes("Stripe")) {
        status = 500;
        message = "Erro no processamento do pagamento";
      } else if (error.message.includes("autenticação")) {
        status = 401;
        message = "Erro de autenticação";
      } else if (error.message.includes("carregar carrinho")) {
        status = 500;
        message = "Erro ao carregar carrinho";
      } else if (error.message.includes("endereço de entrega")) {
        status = 400;
        message = "Erro ao atualizar endereço de entrega";
      } else {
        message = error.message;
      }
    }

    return NextResponse.json({ message }, { status });
  }
}
