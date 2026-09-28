import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CheckSquare, Square, Trash2 } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useAppTheme } from "../../../core/theme";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

const SWIPE_THRESHOLD = -80; // How far to swipe left to reveal the trash button

interface ListItemCardProps {
  item: {
    id: string;
    title?: string;
    text?: string;
    quantity?: string;
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
  const Theme = useAppTheme();
  const styles = createStyles(Theme);

  // Tracks how far the card has been swiped
  const translateX = useSharedValue(0);

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle(item.id);
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
    onDelete(item.id);
  };

  // Define the swipe physics
  const pan = Gesture.Pan()
    .activeOffsetX([-10, 10]) // Only trigger on horizontal swipes
    .onUpdate((event) => {
      // Only allow swiping left (negative translation)
      if (event.translationX < 0) {
        translateX.value = event.translationX;
      }
    })
    .onEnd((event) => {
      // If swiped past the threshold, snap it open to reveal the button
      if (event.translationX < SWIPE_THRESHOLD) {
        translateX.value = withSpring(SWIPE_THRESHOLD, { damping: 15 });
      } else {
        // Otherwise, snap it back closed
        translateX.value = withSpring(0, { damping: 15 });
      }
    });

  // Apply the movement to the card
  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.container}>
      {/* 1. Background Layer (Red Trash Button) - Forced to back for Android */}
      <View style={styles.deleteBackground}>
        <TouchableOpacity
          onPress={handleDelete}
          style={styles.deleteButtonContainer}
          activeOpacity={0.7}
        >
          <Trash2 size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* 2. Foreground Layer (The swipable card) - Forced to front for Android */}
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[
            styles.card,
            item.isCompleted && styles.cardCompleted,
            animatedCardStyle,
          ]}
        >
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={handleToggle}
            activeOpacity={0.7}
          >
            {item.isCompleted ? (
              <CheckSquare size={24} color={Theme.colors.success} />
            ) : (
              <Square size={24} color={Theme.colors.border} />
            )}

            {item.quantity ? (
              <View
                style={[
                  styles.quantityPill,
                  item.isCompleted && styles.quantityPillCompleted,
                ]}
              >
                <Text
                  style={[
                    styles.quantityText,
                    item.isCompleted && styles.itemTextCompleted,
                  ]}
                >
                  {item.quantity}
                </Text>
              </View>
            ) : null}

            <Text
              style={[
                styles.itemText,
                item.isCompleted && styles.itemTextCompleted,
              ]}
            >
              {item.title || item.text}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const createStyles = (Theme: any) =>
  StyleSheet.create({
    container: {
      marginBottom: Theme.spacing.sm,
      position: "relative",
      borderRadius: Theme.radii.md,
      overflow: "hidden", // Keeps the red background within the card's shape
    },
    deleteBackground: {
      position: "absolute", // Fixed styling
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: Theme.colors.danger,
      borderRadius: Theme.radii.md,
      flexDirection: "row",
      justifyContent: "flex-end", // Aligns the trash icon to the right
      alignItems: "center",
      zIndex: 0, // ANDROID FIX: Force to background
    },
    deleteButtonContainer: {
      width: 80,
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
    card: {
      width: "100%", // ANDROID FIX: Force to cover the background
      zIndex: 1, // ANDROID FIX: Force to foreground
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: Theme.colors.surface,
      padding: Theme.spacing.md,
      borderRadius: Theme.radii.md,
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
    quantityPill: {
      backgroundColor: Theme.colors.background,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      marginLeft: Theme.spacing.md,
      borderWidth: 1,
      borderColor: Theme.colors.border,
    },
    quantityPillCompleted: {
      opacity: 0.5,
    },
    quantityText: {
      fontSize: 12,
      fontWeight: "600",
      color: Theme.colors.primary,
    },
    itemText: {
      ...Theme.typography.body,
      marginLeft: Theme.spacing.sm,
      flex: 1,
      color: Theme.colors.textPrimary,
    },
    itemTextCompleted: {
      color: Theme.colors.textSecondary,
      textDecorationLine: "line-through",
    },
  });
