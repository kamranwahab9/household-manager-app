import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  Receipt,
  Wrench,
  CheckCircle2,
  Circle,
  Plus,
  X,
} from "lucide-react-native";
import { useAppTheme } from "../../core/theme";
import { useHomeHubStore, Bill, Appliance } from "./hooks/useHomeHubStore";
import { useAuthStore } from "../auth/useAuthStore";
import { supabase } from "../../core/services/supabase";

// NEW: Import the notification service we just created
import {
  setupNotifications,
  scheduleBillReminder,
} from "../../core/services/notifications";

export const HomeHubScreen = () => {
  const Theme = useAppTheme();
  const styles = createStyles(Theme);

  const { user } = useAuthStore();
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const {
    activeTab,
    setActiveTab,
    bills,
    appliances,
    fetchHubData,
    subscribeToHub,
    toggleBillStatus,
    addBill,
    addAppliance,
    deleteBill,
    deleteAppliance,
  } = useHomeHubStore();

  // Modal State
  const [isModalVisible, setModalVisible] = useState(false);
  const [inputTitle, setInputTitle] = useState("");
  const [inputDetail, setInputDetail] = useState(""); // Amount / Brand
  const [inputDate, setInputDate] = useState("");

  useEffect(() => {
    const initHub = async () => {
      // NEW: Ask for notification permissions on load
      await setupNotifications();

      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("household_id")
        .eq("id", user.id)
        .single();

      if (data?.household_id) {
        setHouseholdId(data.household_id);
        await fetchHubData(data.household_id);
        subscribeToHub(data.household_id);
      }
      setIsLoading(false);
    };

    initHub();
  }, [user]);

  // NEW: Made handleSave async so we can schedule the notification
  const handleSave = async () => {
    if (!inputTitle || !inputDetail || !inputDate || !householdId) {
      Alert.alert("Missing Info", "Please fill out all fields.");
      return;
    }

    if (activeTab === "bills") {
      const amount = parseFloat(inputDetail) || 0;
      await addBill(inputTitle, amount, inputDate, householdId);

      // NEW: Schedule the local push notification!
      await scheduleBillReminder(inputTitle, inputDate);
    } else {
      await addAppliance(inputTitle, inputDetail, inputDate, householdId);
    }

    setInputTitle("");
    setInputDetail("");
    setInputDate("");
    setModalVisible(false);
  };

  const confirmDelete = (id: string, type: "bill" | "appliance") => {
    Alert.alert("Delete Item", "Are you sure you want to remove this?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => (type === "bill" ? deleteBill(id) : deleteAppliance(id)),
      },
    ]);
  };

  const renderBill = ({ item }: { item: Bill }) => (
    <TouchableOpacity
      style={[styles.card, item.isPaid && styles.cardMuted]}
      onPress={() => toggleBillStatus(item.id, item.isPaid, user?.id || "")}
      onLongPress={() => confirmDelete(item.id, "bill")}
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
            <View style={{ alignItems: "flex-end" }}>
              <CheckCircle2
                size={22}
                color={Theme.colors.success}
                style={styles.checkIcon}
              />
              <Text style={styles.paidByText}>
                {item.paidBy === user?.id ? "Paid by you" : "Paid"}
              </Text>
            </View>
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
    <TouchableOpacity
      style={styles.card}
      onLongPress={() => confirmDelete(item.id, "appliance")}
      activeOpacity={0.7}
    >
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
    </TouchableOpacity>
  );

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
          Join a household in the Profile tab to use the Home Hub!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={Theme.typography.screenTitle}>Home Hub</Text>
        <Text style={styles.subtitleText}>
          Track household utilities and maintenance. Long-press an item to
          delete it.
        </Text>
      </View>

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

      {activeTab === "bills" ? (
        <FlatList
          data={bills}
          keyExtractor={(item) => item.id}
          renderItem={renderBill}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={appliances}
          keyExtractor={(item) => item.id}
          renderItem={renderAppliance}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => setModalVisible(true)}
      >
        <Plus size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior="padding"
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {activeTab === "bills" ? "Add New Bill" : "Add Appliance"}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={24} color={Theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder={
                activeTab === "bills"
                  ? "e.g., Water Bill"
                  : "e.g., Deep Freezer"
              }
              placeholderTextColor={Theme.colors.textSecondary}
              value={inputTitle}
              onChangeText={setInputTitle}
            />

            <TextInput
              style={styles.input}
              placeholder={
                activeTab === "bills"
                  ? "Amount (e.g., 1500)"
                  : "Brand (e.g., Dawlance)"
              }
              placeholderTextColor={Theme.colors.textSecondary}
              value={inputDetail}
              onChangeText={setInputDetail}
              keyboardType={activeTab === "bills" ? "numeric" : "default"}
            />

            <TextInput
              style={styles.input}
              placeholder={
                activeTab === "bills"
                  ? "Due Date (e.g., Oct 15)"
                  : "Next Service (e.g., Dec 2026)"
              }
              placeholderTextColor={Theme.colors.textSecondary}
              value={inputDate}
              onChangeText={setInputDate}
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>
                Save {activeTab === "bills" ? "Bill" : "Appliance"}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const createStyles = (Theme: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: Theme.colors.background },
    header: {
      paddingHorizontal: Theme.spacing.md,
      paddingTop: 60,
      paddingBottom: Theme.spacing.sm,
    },
    subtitleText: { ...Theme.typography.caption, marginTop: Theme.spacing.xs },

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
    activeTabText: { color: Theme.colors.primary },

    listContainer: { paddingHorizontal: Theme.spacing.md, paddingBottom: 100 },
    card: {
      backgroundColor: Theme.colors.surface,
      borderRadius: Theme.radii.md,
      padding: Theme.spacing.md,
      marginBottom: Theme.spacing.sm,
      borderWidth: 1,
      borderColor: Theme.colors.border,
    },
    cardMuted: { backgroundColor: Theme.colors.background, opacity: 0.7 },
    cardHeader: { flexDirection: "row", alignItems: "center" },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: Theme.radii.full,
      backgroundColor: Theme.colors.primaryLight,
      alignItems: "center",
      justifyContent: "center",
      marginRight: Theme.spacing.md,
    },
    cardBody: { flex: 1 },
    title: { ...Theme.typography.body, fontWeight: "600" },
    subtitle: { ...Theme.typography.caption, marginTop: 2 },
    textMuted: {
      color: Theme.colors.textSecondary,
      textDecorationLine: "line-through",
    },
    actionWrap: { alignItems: "flex-end", justifyContent: "center" },
    amount: {
      fontSize: 15,
      fontWeight: "700",
      color: Theme.colors.textPrimary,
    },
    checkIcon: { marginTop: 6 },
    paidByText: {
      fontSize: 10,
      color: Theme.colors.success,
      marginTop: 2,
      fontWeight: "600",
    },

    badgeWrap: { alignItems: "flex-end" },
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

    fab: {
      position: "absolute",
      bottom: 24,
      right: 24,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: Theme.colors.primary,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
      elevation: 5,
    },

    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: Theme.colors.surface,
      borderTopLeftRadius: Theme.radii.lg,
      borderTopRightRadius: Theme.radii.lg,
      padding: Theme.spacing.lg,
      paddingBottom: 40,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: Theme.spacing.lg,
    },
    modalTitle: { ...Theme.typography.screenTitle, fontSize: 20 },
    closeButton: { padding: 4 },

    input: {
      backgroundColor: Theme.colors.background,
      borderWidth: 1,
      borderColor: Theme.colors.border,
      borderRadius: Theme.radii.sm,
      paddingHorizontal: Theme.spacing.md,
      paddingVertical: 14,
      fontSize: 16,
      marginBottom: Theme.spacing.md,
      color: Theme.colors.textPrimary,
    },

    saveButton: {
      backgroundColor: Theme.colors.primary,
      paddingVertical: 16,
      borderRadius: Theme.radii.md,
      alignItems: "center",
      marginTop: Theme.spacing.sm,
    },
    saveButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  });
