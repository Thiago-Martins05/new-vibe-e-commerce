import { NextResponse } from "next/server";

import { SessionManager } from "@/lib/session";

export async function POST() {
  try {
    // Destruir sessão
    await SessionManager.destroySession();

    console.log("✅ Logout realizado com sucesso");

    return NextResponse.json({
      success: true,
      message: "Logout realizado com sucesso",
    });
  } catch (error) {
    console.error("❌ Erro no logout:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
