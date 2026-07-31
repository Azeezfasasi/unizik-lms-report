import Credentials from "next-auth/providers/credentials";
import { connectDB } from "@/lib/db/connectDB";
import { verifyPassword } from "@/lib/auth";
import User from "@/models/User";
import { logAudit } from "@/lib/audit/logAudit";
import type { NextAuthOptions } from "next-auth";

const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "dev-nextauth-secret-change-me";

function requestMeta(req?: { headers?: Record<string, unknown> }) {
  const headers = req?.headers ?? {};
  const forwardedFor = headers["x-forwarded-for"];
  const ipAddress = typeof forwardedFor === "string" ? forwardedFor.split(",")[0]?.trim() : undefined;
  const userAgentHeader = headers["user-agent"];
  const userAgent = typeof userAgentHeader === "string" ? userAgentHeader : undefined;
  return { ipAddress, userAgent };
}

export const authOptions: NextAuthOptions = {
  secret: authSecret,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const email = credentials?.email?.toString();
        const password = credentials?.password?.toString();
        const { ipAddress, userAgent } = requestMeta(req);

        if (!email || !password) {
          return null;
        }

        await connectDB();
        const user = await User.findOne({ email }).select("+password").lean();

        if (!user) {
          await logAudit({
            userName: email,
            userEmail: email,
            action: "LOGIN_FAILED",
            category: "AUTH",
            status: "FAILURE",
            description: `Login failed: no account found for ${email}`,
            ipAddress,
            userAgent,
          });
          return null;
        }

        if (!user.isActive) {
          await logAudit({
            userId: String(user._id),
            userName: user.name,
            userEmail: user.email,
            userRole: user.role,
            action: "LOGIN_FAILED",
            category: "AUTH",
            status: "FAILURE",
            description: `Login failed: account disabled for ${user.name}`,
            ipAddress,
            userAgent,
          });
          return null;
        }

        const isValidPassword = await verifyPassword(password, user.password || "");
        if (!isValidPassword) {
          await logAudit({
            userId: String(user._id),
            userName: user.name,
            userEmail: user.email,
            userRole: user.role,
            action: "LOGIN_FAILED",
            category: "AUTH",
            status: "FAILURE",
            description: `Login failed: incorrect password for ${user.name}`,
            ipAddress,
            userAgent,
          });
          return null;
        }

        await logAudit({
          userId: String(user._id),
          userName: user.name,
          userEmail: user.email,
          userRole: user.role,
          action: "LOGIN_SUCCESS",
          category: "AUTH",
          status: "SUCCESS",
          description: `${user.name} logged in`,
          ipAddress,
          userAgent,
        });

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
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.email = token.email as string;
        session.user.name = (token.name as string) ?? session.user.name;
      }
      return session;
    },
  },
  events: {
    async signOut({ token }) {
      await logAudit({
        userId: token?.id as string | undefined,
        userName: (token?.name as string) || undefined,
        userEmail: (token?.email as string) || undefined,
        userRole: (token?.role as string) || undefined,
        action: "LOGOUT",
        category: "AUTH",
        status: "SUCCESS",
        description: `${(token?.name as string) || "A user"} logged out`,
      });
    },
  },
};
