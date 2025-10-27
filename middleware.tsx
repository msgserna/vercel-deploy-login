import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string): string | undefined {
          // NextRequest.cookies.get(name) -> { name, value } | undefined
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions): void {
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions): void {
          res.cookies.set({ name, value: "", ...options, expires: new Date(0) });
        },
      },
    }
  );

  // ... tu lógica (getUser, redirects, etc.)
  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/protected/:path*", "/login"],
};
