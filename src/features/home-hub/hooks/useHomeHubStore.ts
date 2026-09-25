import { create } from "zustand";
import * as Haptics from "expo-haptics";

export interface Bill {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  isPaid: boolean;
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
  toggleBillStatus: (id: string) => void;
}

export const useHomeHubStore = create<HomeHubState>((set) => ({
  activeTab: "bills",
  bills: [
    {
      id: "1",
      title: "IESCO Electricity",
      amount: 12500,
      dueDate: "2026-10-05",
      isPaid: false,
    },
    {
      id: "2",
      title: "Nayatel Internet",
      amount: 3500,
      dueDate: "2026-09-28",
      isPaid: true,
    },
    {
      id: "3",
      title: "Sui Gas",
      amount: 1200,
      dueDate: "2026-10-10",
      isPaid: false,
    },
  ],
  appliances: [
    {
      id: "1",
      name: "Inverter AC",
      brand: "Dawlance",
      nextServiceDate: "2026-11-01",
    },
    {
      id: "2",
      name: "Refrigerator",
      brand: "Haier",
      nextServiceDate: "2027-01-15",
    },
    {
      id: "3",
      name: "Water Pump Motor",
      brand: "Golden Pumps",
      nextServiceDate: "2026-10-20",
    },
  ],

  setActiveTab: (tab) => {
    Haptics.selectionAsync();
    set({ activeTab: tab });
  },

  toggleBillStatus: (id) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    set((state) => ({
      bills: state.bills.map((b) =>
        b.id === id ? { ...b, isPaid: !b.isPaid } : b,
      ),
    }));
  },
}));
