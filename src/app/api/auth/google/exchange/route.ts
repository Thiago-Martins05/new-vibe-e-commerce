import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { message: "Código de autorização é obrigatório" },
        { status: 400 },
      );
    }

    // Trocar o código por um token de acesso
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: "authorization_code",
        redirect_uri: `${process.env.NEXTAUTH_URL}/auth/google/callback`,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Erro ao trocar código por token:", tokenData);
      return NextResponse.json(
        { message: "Erro ao autenticar com Google" },
        { status: 400 },
      );
    }

    // Obter informações do usuário
    const userResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      },
    );

    const userData = await userResponse.json();

    if (!userResponse.ok) {
      console.error("Erro ao obter dados do usuário:", userData);
      return NextResponse.json(
        { message: "Erro ao obter dados do usuário" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
      },
    });
  } catch (error) {
    console.error("❌ Erro no exchange do Google:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
