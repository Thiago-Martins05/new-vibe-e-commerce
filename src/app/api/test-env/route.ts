import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasGoogleClientId: !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
    environment: process.env.NODE_ENV,
    googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? "Configurado" : "Não configurado",
  });
}
