import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { authDb } from "./auth-db";
import { authSchema } from "./auth-schema";

// Verificar variáveis de ambiente necessárias
console.log("🔍 Verificando variáveis de ambiente do auth...");
console.log(
  "BETTER_AUTH_SECRET:",
  process.env.BETTER_AUTH_SECRET ? "Definida" : "Não definida",
);
console.log(
  "NEXTAUTH_SECRET:",
  process.env.NEXTAUTH_SECRET ? "Definida" : "Não definida",
);
console.log(
  "GOOGLE_CLIENT_ID:",
  process.env.GOOGLE_CLIENT_ID ? "Definida" : "Não definida",
);
console.log(
  "GOOGLE_CLIENT_SECRET:",
  process.env.GOOGLE_CLIENT_SECRET ? "Definida" : "Não definida",
);

if (!process.env.BETTER_AUTH_SECRET && !process.env.NEXTAUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET or NEXTAUTH_SECRET is missing");
}

// Configuração do auth
export const authConfig = {
  secret: process.env.BETTER_AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  user: {
    modelName: "userTable",
  },
  session: {
    modelName: "sessionTable",
  },
  account: {
    modelName: "accountTable",
  },
  trustHost: true,
  basePath: "/api/auth",
  // Configurações de cookies simplificadas
  cookies: {
    secure: false, // Desabilitar secure para desenvolvimento
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  },
  // Configurações adicionais para resolver problemas
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized: () => true,
  },
};

// Função para criar o auth com o db
export const createAuth = () => {
  return betterAuth({
    ...authConfig,
    database: drizzleAdapter(authDb as never, {
      provider: "pg",
      schema: authSchema,
    }),
  });
};
