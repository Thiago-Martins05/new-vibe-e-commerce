

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

// Verificar se DATABASE_URL está definida
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL não está definida");
  throw new Error("DATABASE_URL is not defined");
}

console.log("🔗 Configurando conexão com banco de dados...");
console.log("🌍 NODE_ENV:", process.env.NODE_ENV);

// Cria o pool de conexão usando a URL do banco
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  max: 10, // Reduzir o número máximo de conexões
  idleTimeoutMillis: 30000, // Tempo limite de inatividade
  connectionTimeoutMillis: 5000, // Aumentar tempo limite de conexão
  allowExitOnIdle: true, // Permitir saída quando ocioso
});

// Testar a conexão
pool.on("error", (err) => {
  console.error("❌ Erro inesperado no cliente ocioso:", err);
});

// Log de conexão bem-sucedida
pool.on("connect", () => {
  console.log("✅ Conectado ao banco de dados PostgreSQL");
});

// Log de desconexão
pool.on("remove", () => {
  console.log("🔌 Cliente removido do pool");
});

console.log("📦 Criando instância do Drizzle...");

// Exporta a instância do Drizzle com o schema
export const db = drizzle(pool, {
  schema,
  logger: process.env.NODE_ENV === "development",
});

console.log("✅ Drizzle configurado com sucesso");

// Função para testar a conexão
export const testConnection = async () => {
  try {
    const result = await db.execute("SELECT 1 as test");
    console.log("✅ Teste de conexão bem-sucedido:", result);
    return true;
  } catch (error) {
    console.error("❌ Teste de conexão falhou:", error);
    return false;
  }
};
