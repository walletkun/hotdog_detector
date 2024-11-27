import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protect the /detect route
  const protectedPaths = ["/detect"];

  if (
    protectedPaths.some((path) => req.nextUrl.pathname.startsWith(path)) &&
    !session
  ) {
    return NextResponse.redirect(new URL("/auth", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/detect/:path*", "/profile/:path*"],
};
