import { create } from "zustand";
import * as Haptics from "expo-haptics";

export type ItemCategory = "groceries" | "chores" | "cooking" | "bills";

export interface ListItem {
  id: string;
  category: ItemCategory;
  title: string;
  isCompleted: boolean;
  assignedTo?: string;
  dueDate?: string;
  createdAt: number;
}

interface ListState {
  items: ListItem[];
  activeCategory: ItemCategory;
  setActiveCategory: (category: ItemCategory) => void;
  addItem: (title: string, category?: ItemCategory) => void;
  toggleItem: (id: string) => void;
  deleteItem: (id: string) => void;
}

export const useListStore = create<ListState>((set, get) => ({
  activeCategory: "groceries",
  items: [
    {
      id: "1",
      category: "groceries",
      title: "Whole Milk (2L)",
      isCompleted: false,
      assignedTo: "Sarah",
      createdAt: Date.now() - 3600000,
    },
    {
      id: "2",
      category: "groceries",
      title: "Sourdough Bread",
      isCompleted: true,
      assignedTo: "Mike",
      createdAt: Date.now() - 7200000,
    },
    {
      id: "3",
      category: "chores",
      title: "Dust living room shelves",
      isCompleted: false,
      assignedTo: "Alex",
      createdAt: Date.now() - 10000000,
    },
    {
      id: "4",
      category: "cooking",
      title: "Marinate chicken for dinner",
      isCompleted: false,
      createdAt: Date.now() - 2000000,
    },
  ],

  setActiveCategory: (category) => {
    Haptics.selectionAsync();
    set({ activeCategory: category });
  },

  addItem: (title, category) => {
    if (!title.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newItem: ListItem = {
      id: Date.now().toString(),
      category: category || get().activeCategory,
      title: title.trim(),
      isCompleted: false,
      createdAt: Date.now(),
    };

    set((state) => ({ items: [newItem, ...state.items] }));
  },

  toggleItem: (id) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, isCompleted: !item.isCompleted } : item,
      ),
    }));
  },

  deleteItem: (id) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },
}));
