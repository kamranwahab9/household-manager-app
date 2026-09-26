import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { UserCircle, LogOut, Home as HomeIcon } from "lucide-react-native";
import { Theme } from "../../core/theme";
import { supabase } from "../../core/services/supabase";
import { useAuthStore } from "../auth/useAuthStore";

export const ProfileScreen = () => {
  const { user, signOut } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [household, setHousehold] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [newHouseholdName, setNewHouseholdName] = useState("");
  const [inviteCodeInput, setInviteCodeInput] = useState("");

  const fetchUserData = async () => {
    setIsLoading(true);
    if (!user) return;

    // Fetch profile
    const { data: pData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    setProfile(pData);

    // Fetch household if linked
    if (pData?.household_id) {
      const { data: hData } = await supabase
        .from("households")
        .select("*")
        .eq("id", pData.household_id)
        .single();
      setHousehold(hData);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const createHousehold = async () => {
    if (!newHouseholdName)
      return Alert.alert("Error", "Enter a household name.");
    if (!user) return Alert.alert("Error", "Not logged in properly.");

    setIsProcessing(true);

    try {
      // 1. Generate a random 6-character code
      const inviteCode = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

      // 2. Create the household
      const { data: hData, error: hError } = await supabase
        .from("households")
        .insert([{ name: newHouseholdName, invite_code: inviteCode }])
        .select()
        .single();

      if (hError) throw new Error(`Household Error: ${hError.message}`);
      if (!hData) throw new Error("Failed to retrieve new household data.");

      // 3. Force-sync (upsert) the profile to ensure it links properly
      const { error: pError } = await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email,
        full_name: profile?.full_name || "Family Admin",
        household_id: hData.id,
      });

      if (pError) throw new Error(`Profile Error: ${pError.message}`);

      // Success
      setNewHouseholdName("");
      Alert.alert("Success!", "Household created successfully.");
      await fetchUserData(); // Reload the UI to show the code
    } catch (error: any) {
      Alert.alert("Failed to Create", error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const joinHousehold = async () => {
    if (!inviteCodeInput) return Alert.alert("Error", "Enter an invite code.");
    if (!user) return;

    setIsProcessing(true);

    try {
      const { data: hData, error: hError } = await supabase
        .from("households")
        .select("*")
        .eq("invite_code", inviteCodeInput.toUpperCase())
        .single();

      if (hError || !hData)
        throw new Error("Invalid invite code. Please check and try again.");

      const { error: pError } = await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email,
        full_name: profile?.full_name || "Family Member",
        household_id: hData.id,
      });

      if (pError) throw new Error(`Profile Error: ${pError.message}`);

      setInviteCodeInput("");
      Alert.alert("Joined!", `Welcome to ${hData.name}`);
      await fetchUserData();
    } catch (error: any) {
      Alert.alert("Join Failed", error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <UserCircle size={64} color={Theme.colors.primary} />
        <Text style={styles.name}>{profile?.full_name || "User"}</Text>
        <Text style={styles.email}>{profile?.email}</Text>
      </View>

      {household ? (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <HomeIcon size={24} color={Theme.colors.primary} />
            <Text style={styles.cardTitle}>{household.name}</Text>
          </View>
          <Text style={styles.cardSubtitle}>Family Invite Code:</Text>

          <View style={styles.codeWrap}>
            <Text style={styles.codeText} selectable={true}>
              {household.invite_code}
            </Text>
          </View>

          <Text style={styles.instructions}>
            Give this code to family members so they can join your hub.
          </Text>
        </View>
      ) : (
        <View style={styles.setupContainer}>
          <Text style={styles.sectionTitle}>Create a Household</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Wahab Family Home"
            placeholderTextColor={Theme.colors.textSecondary}
            value={newHouseholdName}
            onChangeText={setNewHouseholdName}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={createHousehold}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Create & Generate Code</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Join Existing Household</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter 6-digit invite code"
            placeholderTextColor={Theme.colors.textSecondary}
            value={inviteCodeInput}
            onChangeText={setInviteCodeInput}
            autoCapitalize="characters"
          />
          <TouchableOpacity
            style={[styles.button, styles.buttonAlt]}
            onPress={joinHousehold}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color={Theme.colors.primary} />
            ) : (
              <Text
                style={[styles.buttonText, { color: Theme.colors.primary }]}
              >
                Join Household
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
        <LogOut size={20} color={Theme.colors.danger} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    padding: Theme.spacing.lg,
    paddingTop: 60,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { alignItems: "center", marginBottom: 40 },
  name: { ...Theme.typography.screenTitle, fontSize: 24, marginTop: 12 },
  email: { ...Theme.typography.body, color: Theme.colors.textSecondary },

  card: {
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.lg,
    borderRadius: Theme.radii.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 12,
    color: Theme.colors.textPrimary,
  },
  cardSubtitle: { ...Theme.typography.caption, fontSize: 14, marginBottom: 8 },
  codeWrap: {
    backgroundColor: Theme.colors.primaryLight,
    padding: 16,
    borderRadius: Theme.radii.md,
    alignItems: "center",
  },
  codeText: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 4,
    color: Theme.colors.primary,
  },
  instructions: {
    ...Theme.typography.caption,
    textAlign: "center",
    marginTop: 16,
  },

  setupContainer: { flex: 1 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Theme.colors.textPrimary,
    marginBottom: 12,
  },
  input: {
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radii.md,
    padding: 16,
    fontSize: 16,
    marginBottom: 12,
    color: Theme.colors.textPrimary,
  },
  button: {
    backgroundColor: Theme.colors.primary,
    padding: 16,
    borderRadius: Theme.radii.md,
    alignItems: "center",
  },
  buttonAlt: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: Theme.colors.primary,
  },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.border,
    marginVertical: 32,
  },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "auto",
    paddingVertical: 20,
  },
  logoutText: {
    color: Theme.colors.danger,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
