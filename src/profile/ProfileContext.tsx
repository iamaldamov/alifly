import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../auth/AuthContext";

export type AvatarId = "sprout" | "leaf" | "moon" | "star" | "book" | "palm";
export type Gender = "female" | "male" | "prefer_not_to_say" | null;

export type UserProfile = {
  user_id: string;
  display_name: string;
  age: number | null;
  gender: Gender;
  avatar_id: AvatarId;
  trial_started_at: string;
  trial_ends_at: string;
  created_at: string;
  updated_at: string;
};

type ProfileInput = {
  display_name: string;
  age: number | null;
  gender: Gender;
  avatar_id: AvatarId;
};

type ProfileContextValue = {
  profile: UserProfile | null;
  profileLoading: boolean;
  profileError: string | null;
  saveProfile: (input: ProfileInput) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextValue>({
  profile: null,
  profileLoading: false,
  profileError: null,
  saveProfile: async () => false,
  refreshProfile: async () => {},
});

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user, authReady } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }

    setProfileLoading(true);
    setProfileError(null);
    const { data, error } = await supabase
      .from("user_profiles")
      .select("user_id, display_name, age, gender, avatar_id, trial_started_at, trial_ends_at, created_at, updated_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      setProfileError("Не удалось загрузить профиль. Проверь подключение и попробуй ещё раз.");
      setProfileLoading(false);
      return;
    }

    if (!data) {
      setProfileError("Профиль ещё создаётся. Обнови страницу через несколько секунд.");
      setProfileLoading(false);
      return;
    }

    setProfile(data as UserProfile);
    setProfileLoading(false);
  }, [user?.id]);

  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      setProfile(null);
      setProfileError(null);
      setProfileLoading(false);
      return;
    }
    void refreshProfile();
  }, [authReady, user?.id, refreshProfile]);

  const saveProfile = useCallback(async (input: ProfileInput) => {
    if (!user) return false;
    setProfileError(null);
    const { data, error } = await supabase
      .from("user_profiles")
      .update({
        display_name: input.display_name.trim(),
        age: input.age,
        gender: input.gender,
        avatar_id: input.avatar_id,
      })
      .eq("user_id", user.id)
      .select("user_id, display_name, age, gender, avatar_id, trial_started_at, trial_ends_at, created_at, updated_at")
      .single();

    if (error || !data) {
      setProfileError("Не удалось сохранить изменения. Попробуй ещё раз.");
      return false;
    }

    setProfile(data as UserProfile);
    return true;
  }, [user?.id]);

  const value = useMemo(
    () => ({ profile, profileLoading, profileError, saveProfile, refreshProfile }),
    [profile, profileLoading, profileError, saveProfile, refreshProfile],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  return useContext(ProfileContext);
}
