import { createClient } from "@supabase/supabase-js";

const FALLBACK_SUPABASE_URL = "https://pafbyysujmeuhnvpmokq.supabase.co";
const FALLBACK_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhZmJ5eXN1am1ldWhudnBtb2txIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NjU4MDIsImV4cCI6MjA5MDQ0MTgwMn0.fUYNCdB0QxtCVuTVipeAMLuqhuxOCos0JmI4YYKoNk4";

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || FALLBACK_SUPABASE_URL;
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
