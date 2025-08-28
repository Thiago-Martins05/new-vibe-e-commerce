import "dotenv/config";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { authSchema } from "./auth-schema";

// Verificar se DATABASE_URL está definida
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

// Cria o pool de conexão usando a URL do banco
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? {
          rejectUnauthorized: false,
        }
      : false,
});

// Testar a conexão
pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

// Log de conexão bem-sucedida
pool.on("connect", () => {
  console.log("✅ Conectado ao banco de dados de autenticação PostgreSQL");
});

// Exporta a instância do Drizzle com o schema do auth
export const authDb = drizzle(pool, { schema: authSchema });
