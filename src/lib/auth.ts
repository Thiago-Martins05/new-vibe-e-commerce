import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const nextAuth = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Permitir login apenas com Google
      return account?.provider === "google";
    },
    async session({ session, token }) {
      return session;
    },
  },
});

export const { handlers, auth, signIn, signOut } = nextAuth;
