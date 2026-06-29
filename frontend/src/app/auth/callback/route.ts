import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  // Handle errors from OAuth provider
  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  // Handle the OAuth callback
  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (user) {
        await supabase.from("profiles").upsert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || ""
        });
      }

      return NextResponse.redirect(new URL("/account", request.url));
    }

    return NextResponse.redirect(
      new URL(`/login?error=Unable to authenticate`, request.url)
    );
  }

  return NextResponse.redirect(new URL("/login", request.url));
}
