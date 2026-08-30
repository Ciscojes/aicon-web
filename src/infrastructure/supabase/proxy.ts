import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseEnvironment } from "./env";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const environment = getSupabaseEnvironment();

  const supabase = createServerClient(
    environment.NEXT_PUBLIC_SUPABASE_URL,
    environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && request.nextUrl.pathname.startsWith("/panel")) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/iniciar-sesion";
    loginUrl.searchParams.set("siguiente", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}
