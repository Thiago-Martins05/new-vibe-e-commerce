import { redirect } from "next/navigation";

import { SessionManager } from "@/lib/session";
import IdentificationClient from "./components/identification-client";

// Configurações para evitar pre-render
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const IndentificationPage = async () => {
  // Verificar se o usuário possui alguma sessão
  const session = await SessionManager.getSession();

  if (!session?.userId) {
    redirect("/");
  }

  // Usar componente client-side que vai gerenciar o carrinho
  return <IdentificationClient />;
};

export default IndentificationPage;
