import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import {
  CheckSquare,
  Timer,
  Receipt,
  ArrowRight,
  Activity,
} from "lucide-react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { Theme } from "../../core/theme";

import { useListStore } from "../lists/hooks/useListStore";
import { useTimerStore } from "../timer/hooks/useTimerStore";
import { useHomeHubStore } from "../home-hub/hooks/useHomeHubStore";

export const DashboardScreen = () => {
  const navigation = useNavigation<NavigationProp<any>>();

  // FIX: Select the raw arrays from Zustand first, THEN filter locally
  // to avoid triggering an infinite re-render loop.
  const allItems = useListStore((state) => state.items);
  const pendingItems = allItems.filter((item) => !item.isCompleted);

  const allBills = useHomeHubStore((state) => state.bills);
  const unpaidBills = allBills.filter((bill) => !bill.isPaid);

  const { isRunning, activeLabel, remainingSeconds } = useTimerStore();

  const [, setTick] = useState(0);
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => setTick((t) => t + 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={Theme.typography.screenTitle}>Good afternoon, Kamran</Text>
        <Text style={styles.subtitle}>
          Here is your household overview for today.
        </Text>
      </View>

      {/* Active Timer Widget */}
      <TouchableOpacity
        style={[styles.widgetCard, isRunning && styles.widgetCardActive]}
        activeOpacity={0.8}
        onPress={() => navigation.navigate("Timer")}
      >
        <View style={styles.widgetHeader}>
          <View
            style={[
              styles.iconWrap,
              isRunning ? { backgroundColor: "rgba(255,255,255,0.2)" } : {},
            ]}
          >
            <Timer
              size={20}
              color={isRunning ? "#FFFFFF" : Theme.colors.primary}
            />
          </View>
          <Text style={[styles.widgetTitle, isRunning && { color: "#FFFFFF" }]}>
            {isRunning ? "Active Timer" : "No Active Timers"}
          </Text>
          <ArrowRight
            size={18}
            color={isRunning ? "#FFFFFF" : Theme.colors.textSecondary}
          />
        </View>

        {isRunning && (
          <View style={styles.activeTimerContent}>
            <Text style={styles.activeTimerLabel}>{activeLabel}</Text>
            <Text style={styles.activeTimerDigits}>
              {formatTime(remainingSeconds)}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Pending Tasks Summary */}
      <TouchableOpacity
        style={styles.summaryCard}
        activeOpacity={0.7}
        onPress={() => navigation.navigate("Lists")}
      >
        <View style={styles.summaryLeft}>
          <CheckSquare
            size={24}
            color={Theme.colors.accent}
            style={styles.summaryIcon}
          />
          <View>
            <Text style={styles.summaryTitle}>
              {pendingItems.length} Tasks Remaining
            </Text>
            <Text style={styles.summarySub}>
              Groceries, chores, and cooking
            </Text>
          </View>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>View</Text>
        </View>
      </TouchableOpacity>

      {/* Unpaid Bills Summary */}
      <TouchableOpacity
        style={styles.summaryCard}
        activeOpacity={0.7}
        onPress={() => navigation.navigate("HomeHub")}
      >
        <View style={styles.summaryLeft}>
          <Receipt
            size={24}
            color={Theme.colors.danger}
            style={styles.summaryIcon}
          />
          <View>
            <Text style={styles.summaryTitle}>
              {unpaidBills.length} Unpaid Bills
            </Text>
            <Text style={styles.summarySub}>Requires your attention</Text>
          </View>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Pay</Text>
        </View>
      </TouchableOpacity>

      {/* Quick Status Feed */}
      <Text style={[Theme.typography.sectionTitle, styles.sectionHeader]}>
        Household Status
      </Text>
      <View style={styles.statusBox}>
        <View style={styles.statusRow}>
          <Activity size={16} color={Theme.colors.success} />
          <Text style={styles.statusText}>All network nodes online</Text>
        </View>
        <View style={styles.statusRow}>
          <Activity size={16} color={Theme.colors.success} />
          <Text style={styles.statusText}>Security system armed</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  content: {
    paddingHorizontal: Theme.spacing.md,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: { marginBottom: Theme.spacing.lg },
  subtitle: {
    ...Theme.typography.caption,
    marginTop: Theme.spacing.xs,
    fontSize: 14,
  },

  widgetCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radii.lg,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  widgetCardActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  widgetHeader: { flexDirection: "row", alignItems: "center" },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: Theme.radii.full,
    backgroundColor: Theme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Theme.spacing.sm,
  },
  widgetTitle: { flex: 1, ...Theme.typography.body, fontWeight: "600" },
  activeTimerContent: {
    marginTop: Theme.spacing.md,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.1)",
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.radii.md,
  },
  activeTimerLabel: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  activeTimerDigits: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "700",
    letterSpacing: -1,
  },

  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radii.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  summaryLeft: { flexDirection: "row", alignItems: "center" },
  summaryIcon: { marginRight: Theme.spacing.md },
  summaryTitle: { ...Theme.typography.body, fontWeight: "600" },
  summarySub: { ...Theme.typography.caption, marginTop: 2 },
  badge: {
    backgroundColor: Theme.colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Theme.radii.full,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: Theme.colors.textPrimary,
  },

  sectionHeader: {
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.sm,
  },
  statusBox: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radii.md,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Theme.spacing.sm,
  },
  statusText: {
    marginLeft: Theme.spacing.sm,
    fontSize: 14,
    color: Theme.colors.textSecondary,
    fontWeight: "500",
  },
});
