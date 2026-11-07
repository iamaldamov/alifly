import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://nmgyyrbqjfywxzweansj.supabase.co";
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_3FnyEfdHyP05ZT_Kw9XycQ_l0kqrO7c";

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // Use PKCE for email and social sign-in; ALIFLY handles the callback to show helpful errors.
    flowType: "pkce",
    detectSessionInUrl: false,
  },
});
