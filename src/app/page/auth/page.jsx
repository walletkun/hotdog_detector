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
  const isRegistered = searchParams.get("registered");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegistered) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        alert("Check your email for confirmation link");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-yellow-100 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-red-600">
          {isRegistered ? "Create Account" : "Welcome Back"}
        </h2>
        <form className="space-y-6" onSubmit={handleAuth}>
          <div>
            <Input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={loading}
            >
            {loading ? "Hotdogging..." : isRegistered ? "Hotdog Up" : "Hotdog In"}
            </Button>

            <div className="text-center hover:text-red-600">
                <Button
                variant='link'
                onClick={()=> router.push(isRegistered ? '/auth' : '/auth?mode=register')}>
                    {isRegistered ? "Already in the hotdog gang ?" : "New to the hotdog gang ?"}
                </Button>
            </div>
        </form>
      </div>
    </div>
  );
}
