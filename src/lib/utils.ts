import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getBaseUrl() {
  // Para desenvolvimento local, sempre usar localhost:3000
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }

  // Para Vercel
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Para Render
  if (process.env.RENDER_INTERNAL_HOSTNAME) {
    return `http://${process.env.RENDER_INTERNAL_HOSTNAME}:${process.env.PORT}`;
  }

  // URL pública configurada
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  // URL de produção configurada
  if (process.env.NODE_ENV === "production" && process.env.PRODUCTION_URL) {
    return process.env.PRODUCTION_URL;
  }

  // Fallback para produção
  if (process.env.NODE_ENV === "production") {
    // Se estiver em produção mas não tiver URL configurada, usar um fallback
    return "https://new-vibe.vercel.app";
  }

  // Fallback final
  const port = process.env.PORT ?? 3000;
  return `http://localhost:${port}`;
}
