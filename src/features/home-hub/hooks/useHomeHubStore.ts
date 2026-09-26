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
  addBill: (title: string, amount: number, dueDate: string) => void;
  addAppliance: (name: string, brand: string, nextServiceDate: string) => void;
  deleteBill: (id: string) => void;
  deleteAppliance: (id: string) => void;
}

export const useHomeHubStore = create<HomeHubState>((set) => ({
  activeTab: "bills",
  bills: [
    {
      id: "1",
      title: "IESCO Electricity",
      amount: 12500,
      dueDate: "Oct 5",
      isPaid: false,
    },
    {
      id: "2",
      title: "Nayatel Internet",
      amount: 3500,
      dueDate: "Sept 28",
      isPaid: true,
    },
  ],
  appliances: [
    {
      id: "1",
      name: "Inverter AC",
      brand: "Dawlance",
      nextServiceDate: "Nov 1, 2026",
    },
    {
      id: "2",
      name: "Refrigerator",
      brand: "Haier",
      nextServiceDate: "Jan 15, 2027",
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

  addBill: (title, amount, dueDate) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const newBill: Bill = {
      id: Date.now().toString(),
      title,
      amount,
      dueDate,
      isPaid: false,
    };
    set((state) => ({ bills: [...state.bills, newBill] }));
  },

  addAppliance: (name, brand, nextServiceDate) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const newAppliance: Appliance = {
      id: Date.now().toString(),
      name,
      brand,
      nextServiceDate,
    };
    set((state) => ({ appliances: [...state.appliances, newAppliance] }));
  },

  deleteBill: (id) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    set((state) => ({ bills: state.bills.filter((b) => b.id !== id) }));
  },

  deleteAppliance: (id) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    set((state) => ({
      appliances: state.appliances.filter((a) => a.id !== id),
    }));
  },
}));
