import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const publicRoutes = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/api/auth", "/api/auth/"];

const adminRoutes = [
  "/dashboard",
  "/faculty-departments",
  "/curriculum",
  "/examiner-report",
  "/reports",
  "/students",
  "/users",
];

const authenticatedRoutes = ["/settings", "/student-reports"];

function matchesRoute(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicRoutes.some((route) => matchesRoute(pathname, route))) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  });

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const userRole = token.role as string | undefined;

  if (adminRoutes.some((route) => matchesRoute(pathname, route))) {
    if (!userRole || !["ADMIN", "FACULTY_OFFICER", "EXAMINER"].includes(userRole)) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (authenticatedRoutes.some((route) => matchesRoute(pathname, route))) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
