import React, { useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Plus } from "lucide-react-native";
import { useAppTheme } from "../../core/theme";
import { ItemCategory, useListStore } from "./hooks/useListStore";
import { ListItemCard } from "./components/ListItemCard";

const CATEGORIES: { label: string; value: ItemCategory }[] = [
  { label: "Groceries", value: "groceries" },
  { label: "Chores", value: "chores" },
  { label: "Cooking", value: "cooking" },
  { label: "Bills", value: "bills" },
];

export const ListsScreen = () => {
  // 1. Initialize the dynamic theme
  const Theme = useAppTheme();
  const styles = createStyles(Theme);

  const [inputText, setInputText] = useState("");
  const {
    items,
    activeCategory,
    setActiveCategory,
    addItem,
    toggleItem,
    deleteItem,
  } = useListStore();

  const filteredItems = items.filter(
    (item) => item.category === activeCategory,
  );

  const handleAdd = () => {
    if (!inputText.trim()) return;
    addItem(inputText);
    setInputText("");
  };

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

      {/* Quick Input Bar */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={`Add item to ${activeCategory}...`}
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

// 2. Wrap the styles in a function that receives the Theme
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
    input: {
      flex: 1,
      height: 44,
      backgroundColor: Theme.colors.background,
      borderRadius: Theme.radii.sm,
      paddingHorizontal: Theme.spacing.md,
      fontSize: 15,
      color: Theme.colors.textPrimary,
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
