interface SessionData {
  userId: string;
  userEmail: string;
  userName: string;
  sessionId: string;
  timestamp: number;
}

class SessionManager {
  private static instance: SessionManager;
  private sessionData: SessionData | null = null;
  private sessionKey = "newvibe_session_data";

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  private loadFromStorage(): void {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(this.sessionKey);
        if (stored) {
          const data = JSON.parse(stored);
          const now = Date.now();

          // Verificar se a sessão não expirou (24 horas)
          if (now - data.timestamp < 24 * 60 * 60 * 1000) {
            this.sessionData = data;
            console.log("✅ Sessão carregada do localStorage:", data.userEmail);
          } else {
            console.log("⚠️ Sessão expirada, removendo...");
            this.clearSession();
          }
        }
      } catch (error) {
        console.error("❌ Erro ao carregar sessão:", error);
        this.clearSession();
      }
    }
  }

  public async getSession(): Promise<SessionData | null> {
    // Se já temos dados locais, usar eles
    if (this.sessionData) {
      return this.sessionData;
    }

    // Se não temos dados locais, tentar obter do servidor
    try {
      const response = await fetch("/api/save-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.sessionData) {
          this.saveSession(data.sessionData);
          return data.sessionData;
        }
      }
    } catch (error) {
      console.log("⚠️ Erro ao obter sessão do servidor:", error);
    }

    // Se não conseguir do servidor, usar sessão local
    return this.sessionData;
  }

  public saveSession(sessionData: SessionData): void {
    this.sessionData = sessionData;

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
        console.log("💾 Sessão salva no localStorage:", sessionData.userEmail);
      } catch (error) {
        console.error("❌ Erro ao salvar sessão:", error);
      }
    }
  }

  public clearSession(): void {
    this.sessionData = null;

    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(this.sessionKey);
        console.log("🗑️ Sessão removida do localStorage");
      } catch (error) {
        console.error("❌ Erro ao remover sessão:", error);
      }
    }
  }

  public isAuthenticated(): boolean {
    return this.sessionData !== null;
  }

  public getUserId(): string | null {
    return this.sessionData?.userId || null;
  }

  public getUserEmail(): string | null {
    return this.sessionData?.userEmail || null;
  }
}

export const sessionManager = SessionManager.getInstance();
