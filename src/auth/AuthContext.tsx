import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { EmailOtpType, Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  authReady: boolean;
  authCallbackError: string | null;
};

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  authReady: false,
  authCallbackError: null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authCallbackError, setAuthCallbackError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let receivedAuthEvent = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      receivedAuthEvent = true;
      if (active) {
        setSession(nextSession);
        setAuthReady(true);
      }
    });

    const initializeAuth = async () => {
      const callbackUrl = new URL(window.location.href);
      const hashParams = new URLSearchParams(callbackUrl.hash.replace(/^#/, ""));
      const code = callbackUrl.searchParams.get("code");
      const tokenHash = callbackUrl.searchParams.get("token_hash") || hashParams.get("token_hash");
      const callbackType = callbackUrl.searchParams.get("type") || hashParams.get("type");
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const callbackError = callbackUrl.searchParams.get("error_description") || callbackUrl.searchParams.get("error") || hashParams.get("error_description") || hashParams.get("error");

      if (callbackError && active) {
        setAuthCallbackError("Ссылка не сработала или уже устарела. Вернись в ALIFLY и запроси новую ссылку для входа.");
      } else if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error && active) {
          setAuthCallbackError("Не удалось подтвердить ссылку. Возможно, она уже использована или истёк срок её действия. Запроси новую ссылку.");
        }
      } else if (tokenHash) {
        const allowedTypes: EmailOtpType[] = ["signup", "invite", "magiclink", "recovery", "email_change", "email"];
        const type = allowedTypes.includes(callbackType as EmailOtpType) ? callbackType as EmailOtpType : "email";
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
        if (error && active) {
          setAuthCallbackError("Не удалось подтвердить ссылку. Запроси новую ссылку для входа и открой её один раз.");
        }
      } else if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        if (error && active) {
          setAuthCallbackError("Не удалось завершить вход. Запроси новую ссылку и открой её ещё раз.");
        }
      }

      if (code || tokenHash || accessToken || callbackError) {
        ["code", "token_hash", "type", "error", "error_description", "error_code"].forEach((key) => callbackUrl.searchParams.delete(key));
        callbackUrl.hash = "";
        window.history.replaceState({}, document.title, callbackUrl.pathname + callbackUrl.search);
      }

      const { data, error } = await supabase.auth.getSession();
      if (!active) return;
      if (!receivedAuthEvent && !error) setSession(data.session);
      setAuthReady(true);
    };

    void initializeAuth();

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({ session, user: session?.user ?? null, authReady, authCallbackError }),
    [session, authReady, authCallbackError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
