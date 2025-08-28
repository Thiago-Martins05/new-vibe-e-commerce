import { useAuth } from "@/contexts/auth-context";

export const useUserId = () => {
  const { user } = useAuth();

  const getUserId = (): string | null => {
    if (!user) {
      console.log("⚠️ Usuário não autenticado");
      return null;
    }

    console.log("✅ User ID obtido:", user.id);
    return user.id;
  };

  return {
    userId: user?.id || null,
    getUserId,
    isAuthenticated: !!user,
  };
};
