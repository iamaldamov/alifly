import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
};

const AuthContext = createContext<AuthContextValue>({ session: null, user: null });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    let active = true;
    let receivedAuthEvent = false;

    // Subscribe first: Supabase emits INITIAL_SESSION and later auth changes.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      receivedAuthEvent = true;
      if (active) setSession(nextSession);
    });

    // Ignore the async fallback if a newer auth event already supplied the session.
    void supabase.auth.getSession().then(({ data, error }) => {
      if (active && !receivedAuthEvent && !error) setSession(data.session);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(() => ({ session, user: session?.user ?? null }), [session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
