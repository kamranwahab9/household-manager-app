import { create } from "zustand";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../../core/services/supabase";

interface AuthState {
  session: Session | null;
  user: User | null;
  isInitialized: boolean;
  setSession: (session: Session | null) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isInitialized: false,

  setSession: (session) =>
    set({ session, user: session?.user || null, isInitialized: true }),

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null });
  },
}));
