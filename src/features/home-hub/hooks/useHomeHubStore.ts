import { create } from "zustand";
import * as Haptics from "expo-haptics";
import { supabase } from "../../../core/services/supabase";

export interface Bill {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  paidBy: string | null; // Tracks who paid it
}

export interface Appliance {
  id: string;
  name: string;
  brand: string;
  nextServiceDate: string;
}

interface HomeHubState {
  bills: Bill[];
  appliances: Appliance[];
  activeTab: "bills" | "appliances";
  setActiveTab: (tab: "bills" | "appliances") => void;

  // Real-time actions
  fetchHubData: (householdId: string) => Promise<void>;
  subscribeToHub: (householdId: string) => void;

  // Mutations requiring household and user context
  toggleBillStatus: (
    id: string,
    currentStatus: boolean,
    userId: string,
  ) => Promise<void>;
  addBill: (
    title: string,
    amount: number,
    dueDate: string,
    householdId: string,
  ) => Promise<void>;
  addAppliance: (
    name: string,
    brand: string,
    nextServiceDate: string,
    householdId: string,
  ) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;
  deleteAppliance: (id: string) => Promise<void>;
}

export const useHomeHubStore = create<HomeHubState>((set, get) => ({
  activeTab: "bills",
  bills: [],
  appliances: [],

  setActiveTab: (tab) => {
    Haptics.selectionAsync();
    set({ activeTab: tab });
  },

  fetchHubData: async (householdId) => {
    const { data: billsData } = await supabase
      .from("bills")
      .select("*")
      .eq("household_id", householdId)
      .order("created_at", { ascending: false });

    const { data: appData } = await supabase
      .from("appliances")
      .select("*")
      .eq("household_id", householdId)
      .order("created_at", { ascending: false });

    if (billsData) {
      set({
        bills: billsData.map((b) => ({
          id: b.id,
          title: b.title,
          amount: b.amount,
          dueDate: b.due_date,
          isPaid: b.is_paid,
          paidBy: b.paid_by,
        })),
      });
    }

    if (appData) {
      set({
        appliances: appData.map((a) => ({
          id: a.id,
          name: a.name,
          brand: a.brand,
          nextServiceDate: a.next_service_date,
        })),
      });
    }
  },

  subscribeToHub: (householdId) => {
    supabase
      .channel("hub-bills")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bills",
          filter: `household_id=eq.${householdId}`,
        },
        () => get().fetchHubData(householdId),
      )
      .subscribe();

    supabase
      .channel("hub-appliances")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "appliances",
          filter: `household_id=eq.${householdId}`,
        },
        () => get().fetchHubData(householdId),
      )
      .subscribe();
  },

  toggleBillStatus: async (id, currentStatus, userId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Optimistic UI update
    const newPaidStatus = !currentStatus;
    const newPaidBy = newPaidStatus ? userId : null;

    set((state) => ({
      bills: state.bills.map((b) =>
        b.id === id ? { ...b, isPaid: newPaidStatus, paidBy: newPaidBy } : b,
      ),
    }));

    // Sync to backend
    await supabase
      .from("bills")
      .update({ is_paid: newPaidStatus, paid_by: newPaidBy })
      .eq("id", id);
  },

  addBill: async (title, amount, dueDate, householdId) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await supabase.from("bills").insert({
      title,
      amount,
      due_date: dueDate,
      is_paid: false,
      household_id: householdId,
    });
    // Immediately fetch the new list from the database
    await get().fetchHubData(householdId);
  },

  addAppliance: async (name, brand, nextServiceDate, householdId) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await supabase.from("appliances").insert({
      name,
      brand,
      next_service_date: nextServiceDate,
      household_id: householdId,
    });
    // Immediately fetch the new list from the database
    await get().fetchHubData(householdId);
  },

  deleteBill: async (id) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    set((state) => ({ bills: state.bills.filter((b) => b.id !== id) }));
    await supabase.from("bills").delete().eq("id", id);
  },

  deleteAppliance: async (id) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    set((state) => ({
      appliances: state.appliances.filter((a) => a.id !== id),
    }));
    await supabase.from("appliances").delete().eq("id", id);
  },
}));
