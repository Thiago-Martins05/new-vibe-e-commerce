import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
    hasVercelUrl: !!process.env.VERCEL_URL,
    nextAuthUrl: process.env.NEXTAUTH_URL,
    vercelUrl: process.env.VERCEL_URL,
    redirectUri: `${(process.env.NEXTAUTH_URL || process.env.VERCEL_URL || "http://localhost:3000").replace(/\/$/, '')}/auth/google/callback`,
    environment: process.env.NODE_ENV,
  });
}
