import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://pafbyysujmeuhnvpmokq.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhZmJ5eXN1am1ldWhudnBtb2txIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NjU4MDIsImV4cCI6MjA5MDQ0MTgwMn0.fUYNCdB0QxtCVuTVipeAMLuqhuxOCos0JmI4YYKoNk4";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
