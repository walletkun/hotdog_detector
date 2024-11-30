export async function GET(request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    if (code) {
      const supabase = createRouteHandlerClient({ cookies });
      const {
        data: { user },
        error,
      } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("Session error:", error);
        return NextResponse.redirect(new URL("/auth", url.origin));
      }

      if (user) {
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (!existingProfile) {
          const { error: upsertError } = await supabase.from("profiles").upsert(
            {
              id: user.id,
              name: user.email?.split("@")[0] || "Hotdog Enthusiast",
              title: "Novice Wiener Spotter",
              hotdogs_detected: 0,
              not_hotdogs_detected: 0,
              achievements: [],
              recent_stories: [],
            },
            {
              onConflict: "id",
              ignoreDuplicates: false,
            }
          );

          if (upsertError) {
            console.error("Profile creation error:", upsertError);
            return NextResponse.redirect(new URL("/auth", url.origin));
          }
        }

        return NextResponse.redirect(new URL("/profile", url.origin));
      }
    }

    return NextResponse.redirect(new URL("/", url.origin));
  } catch (error) {
    console.error("Callback error:", error);
    return NextResponse.redirect(new URL("/auth", url.origin));
  }
}
