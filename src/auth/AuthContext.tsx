import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextValue>({ session: null, user: null, isLoading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let receivedAuthEvent = false;

    // Subscribe first: Supabase emits INITIAL_SESSION and later auth changes.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      receivedAuthEvent = true;
      if (active) {
        setSession(nextSession);
        setIsLoading(false);
      }
    });

    // Ignore the async fallback if a newer auth event already supplied the session.
    void supabase.auth.getSession().then(({ data, error }) => {
      if (active && !receivedAuthEvent) {
        if (!error) setSession(data.session);
        setIsLoading(false);
      }
    }).catch(() => {
      // Do not leave the onboarding screen waiting forever when the network is unavailable.
      if (active && !receivedAuthEvent) setIsLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(() => ({ session, user: session?.user ?? null, isLoading }), [session, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
