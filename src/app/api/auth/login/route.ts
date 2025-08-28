import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { SessionManager } from "@/lib/session";
import { db } from "@/db";
import { userTable } from "@/lib/auth-schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validação básica
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email e senha são obrigatórios" },
        { status: 400 },
      );
    }

    // Verificar se o usuário já existe
    const existingUsers = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email));
    let user = existingUsers[0];

    if (!user) {
      // Criar novo usuário no banco de dados
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const [newUser] = await db
        .insert(userTable)
        .values({
          id: userId,
          email,
          name: email.split("@")[0],
        })
        .returning();

      user = newUser;
      console.log("✅ Novo usuário criado no banco:", user.id);
    }

    const userData = {
      userId: user.id,
      email: user.email,
      name: user.name,
    };

    // Criar sessão
    await SessionManager.createSession(userData);

    console.log("✅ Login realizado com sucesso:", userData.email);

    return NextResponse.json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error("❌ Erro no login:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
