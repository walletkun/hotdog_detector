import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const res = NextResponse.next();

  try {
    // Create client with both req and res
    const supabase = createMiddlewareClient({ req, res });

    // Refresh the session
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    console.log("Middleware - URL:", req.url);
    console.log("Middleware - Session exists:", !!session);

    // Protect routes
    if (req.nextUrl.pathname.startsWith("/detect")) {
      if (!session) {
        console.log("No session, redirecting to auth");
        return NextResponse.redirect(new URL("/auth", req.url));
      }
    }

    return res;
  } catch (error) {
    console.error("Middleware error:", error);
    // On error, allow the request to continue
    return res;
  }
}

export const config = {
  matcher: ["/detect/:path*"],
};
