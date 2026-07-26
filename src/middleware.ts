import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const publicRoutes = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/manifest.webmanifest", "/api/auth", "/api/auth/", "/api/faculties"];

const adminRoutes = [
  "/dashboard/faculty-departments",
  "/dashboard/curriculum",
  "/dashboard/examiner-report",
  "/dashboard/students",
  "/dashboard/users",
];

const studentDashboardRoute = "/dashboard";
const authenticatedRoutes = [
  "/settings",
  "/dashboard/student-reports",
  "/dashboard/student-reports/new",
  "/dashboard",
  "/dashboard/reports/",
  "/dashboard/lms-rep-report",
  "/dashboard/supervisor-report",
  "/dashboard/lectures-calendar",
  "/dashboard/pg-course-report",
];

function matchesRoute(pathname: string, route: string) {
  if (route.endsWith("/")) {
    return pathname.startsWith(route);
  }

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

  if (matchesRoute(pathname, studentDashboardRoute)) {
    return NextResponse.next();
  }

  if (authenticatedRoutes.some((route) => matchesRoute(pathname, route))) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
