import NextAuth from "next-auth";
import { DefaultSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
  }
}

export const authConfig = authOptions;

export default NextAuth(authConfig);
