import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Check, Trash2 } from "lucide-react-native";
import { Theme } from "../../../core/theme";
import { ListItem } from "../hooks/useListStore";

interface ListItemCardProps {
  item: ListItem;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const ListItemCard: React.FC<ListItemCardProps> = ({
  item,
  onToggle,
  onDelete,
}) => {
  return (
    <View style={[styles.card, item.isCompleted && styles.cardCompleted]}>
      <TouchableOpacity
        style={[styles.checkbox, item.isCompleted && styles.checkboxChecked]}
        onPress={() => onToggle(item.id)}
        activeOpacity={0.7}
      >
        {item.isCompleted && (
          <Check size={14} color="#FFFFFF" strokeWidth={3} />
        )}
      </TouchableOpacity>

      <View style={styles.contentContainer}>
        <Text style={[styles.title, item.isCompleted && styles.titleCompleted]}>
          {item.title}
        </Text>
        {item.assignedTo && (
          <Text style={styles.assignee}>Assigned to {item.assignedTo}</Text>
        )}
      </View>

      <TouchableOpacity
        onPress={() => onDelete(item.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Trash2 size={18} color={Theme.colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.surface,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.radii.md,
    marginBottom: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  cardCompleted: {
    opacity: 0.55,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Theme.spacing.md,
  },
  checkboxChecked: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    ...Theme.typography.body,
    fontWeight: "500",
  },
  titleCompleted: {
    textDecorationLine: "line-through",
    color: Theme.colors.textSecondary,
  },
  assignee: {
    ...Theme.typography.caption,
    marginTop: 2,
  },
});
