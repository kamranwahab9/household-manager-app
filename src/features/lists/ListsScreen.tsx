import React, { useState, useEffect } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { Plus } from "lucide-react-native";
import { useAppTheme } from "../../core/theme";
import { ItemCategory, useListStore } from "./hooks/useListStore";
import { ListItemCard } from "./components/ListItemCard";
import { useAuthStore } from "../auth/useAuthStore";
import { supabase } from "../../core/services/supabase";

const CATEGORIES: { label: string; value: ItemCategory }[] = [
  { label: "Groceries", value: "groceries" },
  { label: "Chores", value: "chores" },
  { label: "Cooking", value: "cooking" },
  { label: "Bills", value: "bills" },
];

export const ListsScreen = () => {
  const Theme = useAppTheme();
  const styles = createStyles(Theme);

  const { user } = useAuthStore();
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Input states
  const [inputText, setInputText] = useState("");
  const [quantityText, setQuantityText] = useState("");

  const {
    items,
    activeCategory,
    setActiveCategory,
    fetchItems,
    subscribeToItems,
    addItem,
    toggleItem,
    deleteItem,
  } = useListStore();

  // 1. Initialize Supabase Data & Subscriptions
  useEffect(() => {
    const initLists = async () => {
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("household_id")
        .eq("id", user.id)
        .single();

      if (data?.household_id) {
        setHouseholdId(data.household_id);

        // Fetch existing items
        await fetchItems(data.household_id);

        // Listen for realtime changes from family members
        subscribeToItems(data.household_id);
      }
      setIsLoading(false);
    };

    initLists();
  }, [user]);

  const filteredItems = items.filter(
    (item) => item.category === activeCategory,
  );

  // 2. Add item with quantity and householdId
  const handleAdd = () => {
    if (!inputText.trim() || !householdId) return;
    addItem(inputText, householdId, quantityText);
    setInputText("");
    setQuantityText(""); // Clear quantity after adding
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  if (!householdId) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center", padding: 20 },
        ]}
      >
        <Text
          style={{
            ...Theme.typography.body,
            textAlign: "center",
            color: Theme.colors.textSecondary,
          }}
        >
          Join a household in the Profile tab to use shared lists!
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={Theme.typography.screenTitle}>Shared Household Lists</Text>
        <Text style={styles.subtitle}>
          Tap to complete with instant haptic sync.
        </Text>
      </View>

      {/* Segmented Category Filter */}
      <View style={styles.categoryRow}>
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.value;
          return (
            <TouchableOpacity
              key={cat.value}
              style={[
                styles.categoryChip,
                isActive && styles.categoryChipActive,
              ]}
              onPress={() => setActiveCategory(cat.value)}
            >
              <Text
                style={[
                  styles.categoryText,
                  isActive && styles.categoryTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Task List */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ListItemCard
            item={item}
            onToggle={toggleItem}
            onDelete={deleteItem}
          />
        )}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No items yet in this list.</Text>
          </View>
        }
      />

      {/* Quick Input Bar with Quantity */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.quantityInput}
          placeholder="Qty (2kg)"
          placeholderTextColor={Theme.colors.textSecondary}
          value={quantityText}
          onChangeText={setQuantityText}
          returnKeyType="next"
        />
        <TextInput
          style={styles.input}
          placeholder={`Add to ${activeCategory}...`}
          placeholderTextColor={Theme.colors.textSecondary}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAdd}
          activeOpacity={0.8}
        >
          <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const createStyles = (Theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Theme.colors.background,
    },
    header: {
      paddingHorizontal: Theme.spacing.md,
      paddingTop: 60,
      paddingBottom: Theme.spacing.sm,
    },
    subtitle: {
      ...Theme.typography.caption,
      marginTop: Theme.spacing.xs,
    },
    categoryRow: {
      flexDirection: "row",
      paddingHorizontal: Theme.spacing.md,
      marginVertical: Theme.spacing.sm,
    },
    categoryChip: {
      paddingVertical: 6,
      paddingHorizontal: 14,
      borderRadius: Theme.radii.full,
      backgroundColor: Theme.colors.surface,
      marginRight: Theme.spacing.sm,
      borderWidth: 1,
      borderColor: Theme.colors.border,
    },
    categoryChipActive: {
      backgroundColor: Theme.colors.primary,
      borderColor: Theme.colors.primary,
    },
    categoryText: {
      fontSize: 13,
      fontWeight: "600",
      color: Theme.colors.textSecondary,
    },
    categoryTextActive: {
      color: "#FFFFFF",
    },
    listContainer: {
      paddingHorizontal: Theme.spacing.md,
      paddingTop: Theme.spacing.sm,
      paddingBottom: 100,
    },
    emptyContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 60,
    },
    emptyText: {
      ...Theme.typography.caption,
      color: Theme.colors.textSecondary,
    },
    inputContainer: {
      flexDirection: "row",
      padding: Theme.spacing.md,
      backgroundColor: Theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: Theme.colors.border,
      alignItems: "center",
    },
    quantityInput: {
      width: 90,
      height: 44,
      backgroundColor: Theme.colors.background,
      borderRadius: Theme.radii.sm,
      paddingHorizontal: Theme.spacing.sm,
      fontSize: 14,
      color: Theme.colors.textPrimary,
      marginRight: Theme.spacing.sm,
      borderWidth: 1,
      borderColor: Theme.colors.border,
    },
    input: {
      flex: 1,
      height: 44,
      backgroundColor: Theme.colors.background,
      borderRadius: Theme.radii.sm,
      paddingHorizontal: Theme.spacing.md,
      fontSize: 15,
      color: Theme.colors.textPrimary,
      borderWidth: 1,
      borderColor: Theme.colors.border,
    },
    addButton: {
      width: 44,
      height: 44,
      borderRadius: Theme.radii.sm,
      backgroundColor: Theme.colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: Theme.spacing.sm,
    },
  });
