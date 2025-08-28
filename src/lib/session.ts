import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "newvibe_session";
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 horas

export interface SessionData {
  userId: string;
  email: string;
  name: string;
  createdAt: number;
}

export class SessionManager {
  static async createSession(userData: Omit<SessionData, "createdAt">) {
    const sessionData: SessionData = {
      ...userData,
      createdAt: Date.now(),
    };

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_DURATION / 1000,
      path: "/",
    });

    console.log("🍪 Sessão criada:", sessionData.email);
    return sessionData;
  }

  static async getSession(): Promise<SessionData | null> {
    try {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

      if (!sessionCookie?.value) {
        console.log("🍪 Nenhum cookie de sessão encontrado");
        return null;
      }

      const sessionData: SessionData = JSON.parse(sessionCookie.value);
      const now = Date.now();

      // Verificar se a sessão não expirou
      if (now - sessionData.createdAt > SESSION_DURATION) {
        console.log("🍪 Sessão expirada, removendo...");
        await this.destroySession();
        return null;
      }

      console.log("🍪 Sessão válida encontrada:", sessionData.email);
      return sessionData;
    } catch (error) {
      console.error("❌ Erro ao obter sessão:", error);
      return null;
    }
  }

  static async getSessionFromRequest(
    request: NextRequest,
  ): Promise<SessionData | null> {
    try {
      const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

      if (!sessionCookie?.value) {
        console.log("🍪 Nenhum cookie de sessão na requisição");
        return null;
      }

      const sessionData: SessionData = JSON.parse(sessionCookie.value);
      const now = Date.now();

      // Verificar se a sessão não expirou
      if (now - sessionData.createdAt > SESSION_DURATION) {
        console.log("🍪 Sessão expirada na requisição");
        return null;
      }

      console.log("🍪 Sessão válida na requisição:", sessionData.email);
      return sessionData;
    } catch (error) {
      console.error("❌ Erro ao obter sessão da requisição:", error);
      return null;
    }
  }

  static async destroySession() {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
    console.log("🍪 Sessão destruída");
  }

  static async refreshSession() {
    const session = await this.getSession();
    if (session) {
      await this.createSession({
        userId: session.userId,
        email: session.email,
        name: session.name,
      });
    }
    return session;
  }
}
