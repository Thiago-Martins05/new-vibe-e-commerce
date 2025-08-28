"use client";

import { useAuth } from "@/contexts/auth-context";

export const useNextAuth = () => {
  const { refreshUser } = useAuth();

  const signInWithGoogle = async () => {
    try {
      // Abrir popup do Google OAuth
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        `https://accounts.google.com/o/oauth2/v2/auth?` +
          `client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&` +
          `redirect_uri=${encodeURIComponent(window.location.origin + "/auth/google/callback")}&` +
          `response_type=code&` +
          `scope=openid email profile&` +
          `access_type=offline`,
        "google-login",
        `width=${width},height=${height},left=${left},top=${top}`,
      );

      if (!popup) {
        return { success: false, error: "Popup bloqueado pelo navegador" };
      }

      // Aguardar resposta do popup
      return new Promise((resolve) => {
        let isResolved = false;

        const checkClosed = setInterval(() => {
          try {
            if (popup.closed && !isResolved) {
              isResolved = true;
              clearInterval(checkClosed);
              resolve({ success: false, error: "Login cancelado" });
            }
          } catch (error) {
            // Ignorar erros de Cross-Origin
            console.log("Popup fechado ou erro de cross-origin");
          }
        }, 1000);

        // Listener para mensagem do popup
        const messageListener = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;

          if (event.data.type === "GOOGLE_LOGIN_SUCCESS" && !isResolved) {
            isResolved = true;
            clearInterval(checkClosed);
            window.removeEventListener("message", messageListener);

            try {
              popup.close();
            } catch (error) {
              // Ignorar erros de Cross-Origin
            }

            // Fazer login com os dados do Google
            handleGoogleLogin(event.data.user);
            resolve({ success: true });
          } else if (event.data.type === "GOOGLE_LOGIN_ERROR" && !isResolved) {
            isResolved = true;
            clearInterval(checkClosed);
            window.removeEventListener("message", messageListener);

            try {
              popup.close();
            } catch (error) {
              // Ignorar erros de Cross-Origin
            }

            resolve({ success: false, error: event.data.error });
          }
        };

        window.addEventListener("message", messageListener);
      });
    } catch (error) {
      console.error("Erro no login com Google:", error);
      return { success: false, error: "Erro ao fazer login com Google" };
    }
  };

  const handleGoogleLogin = async (googleUser: {
    email: string;
    name: string;
    id: string;
  }) => {
    try {
      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: googleUser.email,
          name: googleUser.name,
          googleId: googleUser.id,
        }),
      });

      const result = await response.json();

      if (result.success) {
        await refreshUser();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Erro ao processar login do Google:", error);
      throw error;
    }
  };

  return {
    signInWithGoogle,
  };
};
