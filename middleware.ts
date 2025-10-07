// Updated middleware.ts - Now works with cookies
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Check if user is authenticated - middleware can access cookies
  const token = request.cookies.get("accessToken")?.value;

  // If accessing auth pages and already authenticated, redirect to dashboard
  if (request.nextUrl.pathname.startsWith("/auth/") && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If accessing protected pages without authentication, redirect to login
  const protectedPaths = [
    "/dashboard", // Add this back - now it will work!
    "/meetings",
    "/search",
    "/analytics",
    "/settings",
  ];
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
