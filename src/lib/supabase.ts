import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://nmgyyrbqjfywxzweansj.supabase.co";
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_3FnyEfdHyP05ZT_Kw9XycQ_l0kqrO7c";

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // ALIFLY exchanges the callback code itself so expired/used links can be explained clearly.
    detectSessionInUrl: false,
  },
});
