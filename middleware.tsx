// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Supabase server client con manejo de cookies para middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          res.cookies.set({ name, value: "", ...options, expires: new Date(0) });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = req.nextUrl;

  // Rutas que quieres proteger (añade más si quieres)
  const isProtected =
    pathname.startsWith("/dashboard") || pathname.startsWith("/protected");

  // Si NO hay usuario y es una ruta protegida → redirige a /login?next=...
  if (!user && isProtected) {
    const redirectUrl = new URL("/login", req.url);
    redirectUrl.searchParams.set("next", pathname + search);
    return NextResponse.redirect(redirectUrl);
  }

  // Si SÍ hay usuario y está en /login → mándalo al dashboard
  if (user && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return res;
}

// Aplica el middleware solo a estas rutas
export const config = {
  matcher: ["/dashboard/:path*", "/protected/:path*", "/login"],
};
