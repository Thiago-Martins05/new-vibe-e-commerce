import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 API Exchange - Iniciando...");
    
    const body = await request.json();
    const { code } = body;

    console.log("🔑 Código recebido:", code ? "Sim" : "Não");
    console.log("🔧 GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "Configurado" : "Não configurado");
    console.log("🔧 GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET ? "Configurado" : "Não configurado");
    console.log("🔧 NEXTAUTH_URL:", process.env.NEXTAUTH_URL);

    if (!code) {
      console.log("❌ Código não fornecido");
      return NextResponse.json(
        { message: "Código de autorização é obrigatório" },
        { status: 400 },
      );
    }

    // Trocar o código por um token de acesso
    console.log("🔄 Fazendo requisição para Google OAuth...");
    
    const redirectUri = `${process.env.NEXTAUTH_URL || process.env.VERCEL_URL || "http://localhost:3000"}/auth/google/callback`;
    console.log("🔗 Redirect URI:", redirectUri);
    
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
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();
    console.log("🔄 Resposta do Google:", tokenData);

    if (!tokenResponse.ok) {
      console.error("❌ Erro ao trocar código por token:", tokenData);
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
