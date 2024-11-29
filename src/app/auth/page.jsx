"use client";

import { useState } from "react";

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRegister = searchParams.get("mode") === "register";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [touched, setTouched] = useState({ email: false, password: false });

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegister) {
        // Sign Up
        const { data: authData, error: authError } = await supabase.auth.signUp(
          {
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
          }
        );

        if (authError) {
          setError(authError.message || "Registration failed");
          return;
        }

        // Create Profile
        if (authData?.user?.id) {
          const { data, error: profileError } = await supabase
            .from("profiles")
            .insert([
              {
                id: authData.user.id,
                name: email.split("@")[0],
                title: "Novice Hotdog Spotter",
              },
            ])
            .select(); // Add this to get the created profile data

          if (profileError) {
            console.error("Failed to create Profile:", profileError);
            setError(profileError.message || "Failed to create Profile");
            return;
          }

          console.log("Profile created successfully", data);
        }

        alert("Check your email for confirmation link");
      } else {
        // Sign In
        const { data: signinData, error: signInError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (signInError) {
          setError(signInError.message || "Sign in failed");
          return;
        }

        if (signinData?.user) {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", signinData.user.id)
            .maybeSingle(); // Use maybeSingle instead of single

          if (profileError) {
            console.error("Failed to fetch profile data:", profileError);
            setError(profileError.message || "Failed to fetch profile data");
          } else {
            console.log("Profile data fetched successfully:", profile);
          }
        }
        alert("Sign in successful");
        router.push("/profile");
      }
    } catch (error) {
      setError(error?.message || "An error occurred");
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
              onClick={() =>
                router.push(isRegister ? "/auth" : "/auth?mode=register")
              }
            >
              {isRegister
                ? "Already in the hotdog gang ?"
                : "New to the hotdog gang ?"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
