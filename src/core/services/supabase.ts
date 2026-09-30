import "react-native-url-polyfill/auto"; // <- This is the missing piece!
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const supabaseUrl = "https://qghbuchgxgamyxjlvmkd.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnaGJ1Y2hneGdhbXl4amx2bWtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzMjk2NTQsImV4cCI6MjEwNTkwNTY1NH0.w4KhvmL2vsWHJbb3o76HVZF5iFsuL_adN92k_LcoJEs";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage, // You already correctly had this!
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
