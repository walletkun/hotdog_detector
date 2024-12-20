'use client';

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";


const AuthContext = createContext();


export function AuthProvider({children}){
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        supabase.auth.getSession().then(({data: {session}}) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        const {data: {subscription}} = supabase.auth.onAuthStateChange((_, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            subscription?.unsubscribe();
        }
    }, []);


    const value = {
        user,
        loading
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    return useContext(AuthContext);
}