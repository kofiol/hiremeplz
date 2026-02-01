import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const envSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const envSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (typeof window !== "undefined" && (!envSupabaseUrl || !envSupabaseAnonKey)) {
  console.warn("Missing Supabase environment variables — auth will not work")
}

const supabaseUrl = envSupabaseUrl ?? "http://localhost:54321";
const supabaseAnonKey = envSupabaseAnonKey ?? "dev-anon-key";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

