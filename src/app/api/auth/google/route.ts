import { NextRequest, NextResponse } from "next/server";
import { SessionManager } from "@/lib/session";
import { db } from "@/db";
import { userTable } from "@/lib/auth-schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, googleId } = body;

    // Validação básica
    if (!email || !name || !googleId) {
      return NextResponse.json(
        { message: "Dados do Google são obrigatórios" },
        { status: 400 },
      );
    }

    // Verificar se o usuário já existe
    const existingUsers = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email));

    let user;

    if (existingUsers.length > 0) {
      // Usuário já existe, usar o existente
      user = existingUsers[0];
    } else {
      // Criar novo usuário
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const [newUser] = await db
        .insert(userTable)
        .values({
          id: userId,
          email,
          name,
        })
        .returning();

      user = newUser;
    }

    const userData = {
      userId: user.id,
      email: user.email,
      name: user.name,
    };

    // Criar sessão
    await SessionManager.createSession(userData);

    console.log("✅ Login com Google realizado:", userData.email);

    return NextResponse.json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error("❌ Erro no login com Google:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
