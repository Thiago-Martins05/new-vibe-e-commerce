import { createAuthClient } from "better-auth/react";

// Configuração simplificada do auth client
export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000",
  basePath: "/api/auth",
  fetchOptions: {
    credentials: "include",
  },
});
