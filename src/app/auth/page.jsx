"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRegister = searchParams.get("mode") === "register";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [touched, setTouched] = useState({ email: false, password: false });

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error("Google OAuth error:", error);
        throw error;
      }

      // If data.url exists, redirect the user
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Google sign in error:", error);
      setError(
        "Failed to sign in with Google. Please try again or use email sign in."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegister) {
        console.log("Starting registration for:", email);

        const { data: authData, error: authError } = await supabase.auth.signUp(
          {
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`,
              data: {
                name: email.split("@")[0],
              },
            },
          }
        );

        if (authError) {
          console.log("Auth error:", authError);
          throw authError;
        }

        if (!authData?.user?.id) {
          throw new Error("Failed to create user account");
        }

        console.log("User created successfully:", authData.user.id);

        try {
          console.log("Creating profile for user:", authData.user.id);

          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .insert({
              id: authData.user.id,
              name: email.split("@")[0],
              title: "Novice Wiener Spotter",
              hotdogs_detected: 0,
              not_hotdogs_detected: 0,
              achievements: [],
              recent_stories: [],
            })
            .select()
            .single();

          if (profileError) {
            console.log("Profile creation error:", profileError);
            throw profileError;
          }

          console.log("Profile created successfully:", profileData);
          alert("Please check your email for the confirmation link!");
          router.push("/auth/verify");
        } catch (profileError) {
          console.error("Detailed profile error:", {
            message: profileError.message,
            details: profileError.details,
            hint: profileError.hint,
            status: profileError.status,
            code: profileError.code,
          });
          throw new Error("Failed to create user profile");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        router.push("/");
      }
    } catch (error) {
      console.error("Auth error details:", {
        message: error.message,
        details: error?.details,
        hint: error?.hint,
      });
      setError(error.message || "An error occurred during authentication");
    } finally {
      setLoading(false);
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-yellow-100 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-red-600">
          {isRegister ? "Create Account" : "Welcome Back"}
        </h2>

        <form className="space-y-6" onSubmit={handleAuth}>
          <div>
            <Input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur("email")}
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleBlur("password")}
            />
          </div>

          {error && touched.email && touched.password && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={loading || !email || !password}
          >
            {loading ? "Hotdogging..." : isRegister ? "Hotdog Up" : "Hotdog In"}
          </Button>

          <div className="text-center hover:text-red-600">
            <Button
              variant="link"
              type="button"
              onClick={() => {
                if (isRegister) {
                  router.push("/auth");
                } else {
                  router.push("/auth?mode=register");
                }
              }}
            >
              {isRegister
                ? "Already in the hotdog gang ?"
                : "New to the hotdog gang ?"}
            </Button>
          </div>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <div className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting to Google...
            </div>
          ) : (
            <>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
