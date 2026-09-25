import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
} from "react-native";
import { Receipt, Wrench, CheckCircle2, Circle } from "lucide-react-native";
import { Theme } from "../../core/theme";
import { useHomeHubStore, Bill, Appliance } from "./hooks/useHomeHubStore";

export const HomeHubScreen = () => {
  const { activeTab, setActiveTab, bills, appliances, toggleBillStatus } =
    useHomeHubStore();

  const renderBill = ({ item }: { item: Bill }) => (
    <TouchableOpacity
      style={[styles.card, item.isPaid && styles.cardMuted]}
      onPress={() => toggleBillStatus(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconWrap}>
          <Receipt size={20} color={Theme.colors.primary} />
        </View>
        <View style={styles.cardBody}>
          <Text style={[styles.title, item.isPaid && styles.textMuted]}>
            {item.title}
          </Text>
          <Text style={styles.subtitle}>Due: {item.dueDate}</Text>
        </View>
        <View style={styles.actionWrap}>
          <Text style={[styles.amount, item.isPaid && styles.textMuted]}>
            Rs {item.amount.toLocaleString()}
          </Text>
          {item.isPaid ? (
            <CheckCircle2
              size={22}
              color={Theme.colors.success}
              style={styles.checkIcon}
            />
          ) : (
            <Circle
              size={22}
              color={Theme.colors.border}
              style={styles.checkIcon}
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderAppliance = ({ item }: { item: Appliance }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: Theme.colors.accent + "20" },
          ]}
        >
          <Wrench size={20} color={Theme.colors.accent} />
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.subtitle}>{item.brand}</Text>
        </View>
        <View style={styles.badgeWrap}>
          <Text style={styles.badgeLabel}>Next Service</Text>
          <View style={styles.dateBadge}>
            <Text style={styles.dateBadgeText}>{item.nextServiceDate}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={Theme.typography.screenTitle}>Home Hub</Text>
        <Text style={styles.subtitleText}>
          Track household utilities and maintenance.
        </Text>
      </View>

      {/* Segmented Tab Control */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "bills" && styles.activeTab]}
          onPress={() => setActiveTab("bills")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "bills" && styles.activeTabText,
            ]}
          >
            Monthly Bills
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "appliances" && styles.activeTab]}
          onPress={() => setActiveTab("appliances")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "appliances" && styles.activeTabText,
            ]}
          >
            Appliances
          </Text>
        </TouchableOpacity>
      </View>

      {/* Dynamic List */}
      <FlatList
        data={activeTab === "bills" ? bills : appliances}
        keyExtractor={(item) => item.id}
        renderItem={
          activeTab === "bills" ? renderBill : (renderAppliance as any)
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    paddingHorizontal: Theme.spacing.md,
    paddingTop: 60,
    paddingBottom: Theme.spacing.sm,
  },
  subtitleText: {
    ...Theme.typography.caption,
    marginTop: Theme.spacing.xs,
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: Theme.spacing.md,
    backgroundColor: Theme.colors.border,
    padding: 4,
    borderRadius: Theme.radii.md,
    marginBottom: Theme.spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: Theme.radii.sm,
  },
  activeTab: {
    backgroundColor: Theme.colors.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: Theme.colors.textSecondary,
  },
  activeTabText: {
    color: Theme.colors.primary,
  },
  listContainer: {
    paddingHorizontal: Theme.spacing.md,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radii.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  cardMuted: {
    backgroundColor: Theme.colors.background,
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: Theme.radii.full,
    backgroundColor: Theme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Theme.spacing.md,
  },
  cardBody: {
    flex: 1,
  },
  title: {
    ...Theme.typography.body,
    fontWeight: "600",
  },
  subtitle: {
    ...Theme.typography.caption,
    marginTop: 2,
  },
  textMuted: {
    color: Theme.colors.textSecondary,
    textDecorationLine: "line-through",
  },
  actionWrap: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 15,
    fontWeight: "700",
    color: Theme.colors.textPrimary,
  },
  checkIcon: {
    marginTop: 6,
  },
  badgeWrap: {
    alignItems: "flex-end",
  },
  badgeLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: Theme.colors.textSecondary,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  dateBadge: {
    backgroundColor: Theme.colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Theme.radii.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  dateBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: Theme.colors.textPrimary,
  },
});
