import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true, // ✅ Ensures session is remembered
      detectSessionInUrl: true, // ✅ Needed for magic link login
    },
  });
  
  // ✅ Log session state for debugging
  supabase.auth.onAuthStateChange((event, session) => {
    console.log("Auth State Changed:", event, session);
  });