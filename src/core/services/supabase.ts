import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://qghbuchgxgamyxjlvmkd.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnaGJ1Y2hneGdhbXl4amx2bWtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzMjk2NTQsImV4cCI6MjEwNTkwNTY1NH0.w4KhvmL2vsWHJbb3o76HVZF5iFsuL_adN92k_LcoJEs";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
