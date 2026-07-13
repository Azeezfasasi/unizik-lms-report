import Credentials from "next-auth/providers/credentials";
import { connectDB } from "@/lib/db/connectDB";
import { verifyPassword } from "@/lib/auth";
import User from "@/models/User";
import type { NextAuthOptions } from "next-auth";

const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "dev-nextauth-secret-change-me";

export const authOptions: NextAuthOptions = {
  secret: authSecret,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toString();
        const password = credentials?.password?.toString();

        if (!email || !password) {
          return null;
        }

        await connectDB();
        const user = await User.findOne({ email }).select("+password").lean();

        if (!user || !user.isActive) {
          return null;
        }

        const isValidPassword = await verifyPassword(password, user.password || "");
        if (!isValidPassword) {
          return null;
        }

        return {
          id: String(user._id),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};
