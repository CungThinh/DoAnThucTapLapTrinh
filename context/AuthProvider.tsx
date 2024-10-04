import { createContext, PropsWithChildren, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useContext } from "react";

type profile =  {
    id: string
    role: "USER" | "ADMIN";
}

type AuthData = {
    session: Session | null 
    loading: boolean
    isAdmin: boolean
}

const AuthContext = createContext<AuthData>({
    session: null,
    loading: true,
    isAdmin: false
})


export default function AuthProvider( {children}: PropsWithChildren ) {
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<profile | null>(null)
    useEffect(() => {
        const fetchSession = async () => { 
            const {data: {session}, error} = await supabase.auth.getSession();
            setSession(session)

            if (session) {
                // fetch profile
                const { data } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', session.user.id)
                  .single();
                setProfile(data || null);
            }
            setLoading(false)
        };
        supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
        })
        fetchSession();
     },[])

     const contextValue = {
        session,
        loading,
        isAdmin: profile?.role === 'ADMIN'
     }

    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext);