'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";


export function Header() {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    //Check current session
    supabase.auth.getSession().then(({data: {session}}) => {
      setUser(session?.user ?? null);
      setLoading(false);
    })
    //Listen for auth changes
    const {data: {subscription}} = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    })

    return () => {
      subscription?.unsubscribe();
    }
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };


  return (
    <header className="fixed w-full top-0 left-0 z-50 bg-white bg-opacity-90 shadow-md">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-red-600">
          HotdogAI 2.0
        </Link>
        <nav>
          {
            !loading && (
              <>
                {
                  user ? (
                    <div className="flex items-center gap-4">
                      <span className="text-gray-600">
                        {user.email}
                      </span>
                      <Button 
                        variant='outline'
                        onClick={handleSignOut}
                      >
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Link href={'/auth'}>
                        <Button variant='outline' className="mr-2">
                          Sign In
                        </Button>
                      </Link>

                      <Link href={'/auth?mode=register'}>
                      <Button>Register</Button>
                      </Link>
                    </>
                  )
                }
              </>
            )
          }
        </nav>
      </div>
    </header>
  );
}
