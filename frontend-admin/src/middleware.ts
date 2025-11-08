import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  // Nếu đang ở trang login mà đã có token, chuyển về dashboard
  if (request.nextUrl.pathname.startsWith("/auth") && token) {
    return NextResponse.redirect(new URL("/dashboard/default", request.url));
  }

  // Nếu không ở trang login và không có token, chuyển về trang login
  if (!request.nextUrl.pathname.startsWith("/auth") && !token) {
    return NextResponse.redirect(new URL("/auth/v2/login", request.url));
  }

  return NextResponse.next();
}

// Chỉ định các route cần check auth
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. /_vercel (Vercel internals)
     * 5. /favicon.ico, /sitemap.xml (static files)
     */
    "/((?!api|_next|_static|_vercel|favicon.ico|sitemap.xml).*)",
  ],
};
