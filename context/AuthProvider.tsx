import { createContext, PropsWithChildren, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useContext } from "react";

type profile = {
  id: string;
  role: "USER" | "ADMIN";
};

type AuthData = {
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthData>({
  session: null,
  loading: true,
  isAdmin: false,
});

export default function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<profile | null>(null);

  // Hàm fetch profile
  const fetchProfile = async (currentSession: Session | null) => {
    if (currentSession) {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentSession.user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        setProfile(null);
      } else {
        setProfile(data || null);
      }
    } else {
      setProfile(null); // Xóa profile khi không có session
    }
  };

  useEffect(() => {
    // Hàm fetch session và profile
    const fetchSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      setSession(session);

      if (session) {
        setProfile(null); // Xóa profile cũ trước khi fetch profile mới
        await fetchProfile(session);
      }
      
      setLoading(false);
    };

    fetchSession();

    // Lắng nghe thay đổi session (sign in, sign out)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        setProfile(null); // Xóa profile cũ ngay khi session thay đổi
        await fetchProfile(newSession); // Fetch lại profile mới khi có session mới
      }
    );

    // Cleanup listener khi component unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const contextValue = {
    session,
    loading,
    isAdmin: profile?.role === "ADMIN",
  };


  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
