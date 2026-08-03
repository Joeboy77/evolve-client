import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "evolve_session";
const PUBLIC_ROUTES = ["/login", "/activate", "/link-expired", "/design"];

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = request.cookies.get(SESSION_COOKIE)?.value;
  const homeRoute = role === "STUDENT" ? "/dashboard" : "/admin";

  if (isPublicRoute(pathname)) {
    if (role && (pathname === "/login" || pathname === "/")) {
      return NextResponse.redirect(new URL(homeRoute, request.url));
    }
    return NextResponse.next();
  }

  if (!role) {
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("next", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/") {
    return NextResponse.redirect(new URL(homeRoute, request.url));
  }

  if (role === "STUDENT" && pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Everything except the API proxy, Next internals, and the metadata routes that
    // crawlers fetch without cookies (icons, social images, manifest, robots).
    "/((?!api/|_next/static|_next/image|favicon.ico|icon|apple-icon|opengraph-image|twitter-image|manifest.webmanifest|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};
