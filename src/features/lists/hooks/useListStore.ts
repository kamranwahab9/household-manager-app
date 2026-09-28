import { create } from "zustand";
import * as Haptics from "expo-haptics";
import { supabase } from "../../../core/services/supabase";

export type ItemCategory = "groceries" | "chores" | "cooking" | "bills";

export interface ListItem {
  id: string;
  category: ItemCategory;
  title: string;
  quantity?: string; // 1. Added quantity here
  isCompleted: boolean;
  assignedTo?: string;
  createdAt: number;
}

interface ListState {
  items: ListItem[];
  activeCategory: ItemCategory;
  setActiveCategory: (category: ItemCategory) => void;

  fetchItems: (householdId: string) => Promise<void>;
  subscribeToItems: (householdId: string) => void;

  // 2. Added optional quantity parameter
  addItem: (
    title: string,
    householdId: string,
    quantity?: string,
    category?: ItemCategory,
  ) => Promise<void>;
  toggleItem: (id: string) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
}

export const useListStore = create<ListState>((set, get) => ({
  activeCategory: "groceries",
  items: [],

  setActiveCategory: (category) => {
    Haptics.selectionAsync();
    set({ activeCategory: category });
  },

  fetchItems: async (householdId) => {
    const { data, error } = await supabase
      .from("list_items")
      .select("*")
      .eq("household_id", householdId)
      .order("created_at", { ascending: false });

    if (data && !error) {
      const formattedItems = data.map((item: any) => ({
        id: item.id,
        category: item.category,
        title: item.title,
        quantity: item.quantity, // 3. Map quantity from database
        isCompleted: item.is_completed,
        assignedTo: item.assigned_to,
        createdAt: new Date(item.created_at).getTime(),
      }));
      set({ items: formattedItems });
    }
  },

  subscribeToItems: (householdId) => {
    const channel = supabase
      .channel("multiplayer_lists")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "list_items",
          filter: `household_id=eq.${householdId}`,
        },
        () => {
          get().fetchItems(householdId);
        },
      )
      .subscribe();
  },

  // 4. Update addItem to handle quantity
  addItem: async (title, householdId, quantity, category) => {
    if (!title.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const tempId = Date.now().toString();
    const newItem: ListItem = {
      id: tempId,
      category: category || get().activeCategory,
      title: title.trim(),
      quantity: quantity?.trim(),
      isCompleted: false,
      createdAt: Date.now(),
    };

    set((state) => ({ items: [newItem, ...state.items] }));

    const { data, error } = await supabase
      .from("list_items")
      .insert([
        {
          household_id: householdId,
          category: newItem.category,
          title: newItem.title,
          quantity: newItem.quantity, // Save to database
          is_completed: false,
        },
      ])
      .select()
      .single();

    if (data && !error) {
      set((state) => ({
        items: state.items.map((item) =>
          item.id === tempId ? { ...item, id: data.id } : item,
        ),
      }));
    }
  },

  toggleItem: async (id) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, isCompleted: !item.isCompleted } : item,
      ),
    }));

    const item = get().items.find((i) => i.id === id);
    if (!item) return;

    await supabase
      .from("list_items")
      .update({ is_completed: item.isCompleted })
      .eq("id", id);
  },

  deleteItem: async (id) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);

    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));

    await supabase.from("list_items").delete().eq("id", id);
  },
}));
