"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Função para verificar a sessão no servidor
  const checkSession = async (): Promise<User | null> => {
    try {
      const response = await fetch("/api/auth/check-session", {
        method: "GET",
        credentials: "include", // Importante para enviar cookies
      });

      if (response.ok) {
        const userData = await response.json();
        return userData.user;
      }
      return null;
    } catch (error) {
      console.error("Error checking session:", error);
      return null;
    }
  };

  // Carregar usuário da sessão na inicialização
  useEffect(() => {
    const loadUserFromSession = async () => {
      try {
        const userData = await checkSession();
        if (userData) {
          setUser(userData);
          console.log("✅ Usuário carregado da sessão:", userData.email);
        } else {
          console.log("⚠️ Nenhuma sessão válida encontrada");
        }
      } catch (error) {
        console.error("❌ Erro ao carregar usuário da sessão:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFromSession();
  }, []);

  const login = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log("🔐 Tentando fazer login com:", email);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Importante para receber cookies
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        console.log("✅ Login realizado com sucesso:", data.user.email);
        return { success: true };
      } else {
        const errorData = await response.json();
        console.error("❌ Erro no login:", errorData.message);
        return { success: false, error: errorData.message };
      }
    } catch (error) {
      console.error("❌ Erro no login:", error);
      return { success: false, error: "Erro no login" };
    }
  };

  const logout = async () => {
    try {
      console.log("🚪 Fazendo logout...");

      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      setUser(null);
      console.log("✅ Logout realizado com sucesso");
    } catch (error) {
      console.error("❌ Erro no logout:", error);
      // Mesmo com erro, limpar o estado local
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await checkSession();
      setUser(userData);
    } catch (error) {
      console.error("❌ Erro ao atualizar usuário:", error);
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
