import { NextRequest, NextResponse } from "next/server";

import { SessionManager } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const session = await SessionManager.getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { message: "Sessão não encontrada" },
        { status: 401 },
      );
    }

    // Renovar a sessão se necessário
    await SessionManager.refreshSession();

    return NextResponse.json({
      success: true,
      user: {
        id: session.userId,
        email: session.email,
        name: session.name,
      },
    });
  } catch (error) {
    console.error("❌ Erro ao verificar sessão:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
