import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { SessionManager } from "@/lib/session";
import { db } from "@/db";
import { userTable } from "@/lib/auth-schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Validação básica
    if (!email || !password || !name) {
      return NextResponse.json(
        { message: "Email, senha e nome são obrigatórios" },
        { status: 400 },
      );
    }

    // Verificar se o usuário já existe
    const existingUsers = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email));

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { message: "Email já cadastrado" },
        { status: 400 },
      );
    }

    // Criar novo usuário no banco de dados
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const [newUser] = await db
      .insert(userTable)
      .values({
        id: userId,
        email,
        name,
      })
      .returning();

    const userData = {
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
    };

    // Criar sessão
    await SessionManager.createSession(userData);

    console.log("✅ Novo usuário criado e logado:", userData.email);

    return NextResponse.json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error("❌ Erro no cadastro:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
