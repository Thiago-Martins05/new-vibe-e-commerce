"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function GoogleCallbackContent() {
  const searchParams = useSearchParams();

  const code = searchParams.get("code");
  const error = searchParams.get("error");

  console.log("🔄 Callback Google - Code:", code);
  console.log("🔄 Callback Google - Error:", error);
  console.log("🔄 Callback Google - Window opener:", !!window.opener);

  if (error) {
    console.log("❌ Erro no callback:", error);
    // Enviar erro para a página pai
    window.opener?.postMessage(
      { type: "GOOGLE_LOGIN_ERROR", error },
      window.location.origin,
    );
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-semibold">Erro no login</h2>
          <p className="text-gray-600">Ocorreu um erro durante o login.</p>
        </div>
      </div>
    );
  }

  if (code) {
    // Trocar o código por um token de acesso
    exchangeCodeForToken(code);
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="mb-2 text-xl font-semibold">Processando login...</h2>
        <p className="text-gray-600">Aguarde um momento.</p>
      </div>
    </div>
  );
}

const exchangeCodeForToken = async (code: string) => {
  try {
    console.log("🔄 Trocando código por token...");
    
    const response = await fetch("/api/auth/google/exchange", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });

    const result = await response.json();
    console.log("🔄 Resultado da troca:", result);

    if (result.success) {
      console.log("✅ Login bem-sucedido, enviando mensagem para página pai");
      // Enviar sucesso para a página pai
      window.opener?.postMessage(
        { type: "GOOGLE_LOGIN_SUCCESS", user: result.user },
        window.location.origin,
      );
    } else {
      console.log("❌ Erro no login:", result.message);
      // Enviar erro para a página pai
      window.opener?.postMessage(
        { type: "GOOGLE_LOGIN_ERROR", error: result.message },
        window.location.origin,
      );
    }
  } catch (error) {
    console.log("❌ Erro ao trocar código:", error);
    // Enviar erro para a página pai
    window.opener?.postMessage(
      { type: "GOOGLE_LOGIN_ERROR", error: "Erro ao processar login" },
      window.location.origin,
    );
  }
};

export default function GoogleCallback() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h2 className="mb-2 text-xl font-semibold">Carregando...</h2>
            <p className="text-gray-600">Aguarde um momento.</p>
          </div>
        </div>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  );
}
