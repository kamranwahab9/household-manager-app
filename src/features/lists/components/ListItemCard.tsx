import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CheckSquare, Square, Trash2 } from "lucide-react-native";
import { useAppTheme } from "../../../core/theme";

// Adjust this interface if your useListStore uses different property names (like 'text' instead of 'title')
interface ListItemCardProps {
  item: {
    id: string;
    title?: string;
    text?: string;
    isCompleted: boolean;
    category: string;
  };
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const ListItemCard = ({
  item,
  onToggle,
  onDelete,
}: ListItemCardProps) => {
  // 1. Initialize the dynamic theme
  const Theme = useAppTheme();
  const styles = createStyles(Theme);

  return (
    <View style={[styles.card, item.isCompleted && styles.cardCompleted]}>
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => onToggle(item.id)}
        activeOpacity={0.7}
      >
        {item.isCompleted ? (
          <CheckSquare size={24} color={Theme.colors.success} />
        ) : (
          <Square size={24} color={Theme.colors.border} />
        )}
        <Text
          style={[
            styles.itemText,
            item.isCompleted && styles.itemTextCompleted,
          ]}
        >
          {item.title || item.text}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDelete(item.id)}
        activeOpacity={0.7}
      >
        <Trash2 size={20} color={Theme.colors.danger} />
      </TouchableOpacity>
    </View>
  );
};

// 2. Wrap the styles in a function that receives the Theme
const createStyles = (Theme: any) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: Theme.colors.surface,
      padding: Theme.spacing.md,
      borderRadius: Theme.radii.md,
      marginBottom: Theme.spacing.sm,
      borderWidth: 1,
      borderColor: Theme.colors.border,
    },
    cardCompleted: {
      backgroundColor: Theme.colors.background,
      opacity: 0.7,
    },
    checkboxContainer: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    itemText: {
      ...Theme.typography.body,
      marginLeft: Theme.spacing.md,
      flex: 1,
      color: Theme.colors.textPrimary,
    },
    itemTextCompleted: {
      color: Theme.colors.textSecondary,
      textDecorationLine: "line-through",
    },
    deleteButton: {
      padding: Theme.spacing.xs,
    },
  });
