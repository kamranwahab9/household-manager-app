import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Send } from "lucide-react-native";
import { useAppTheme } from "../core/theme";
import { supabase } from "../core/services/supabase";
import { useAuthStore } from "../features/auth/useAuthStore";

export const ChatScreen = () => {
  const Theme = useAppTheme();
  const styles = createStyles(Theme);

  const { user } = useAuthStore();
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  // 1. Get the user's household ID first
  useEffect(() => {
    const initChat = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("household_id")
        .eq("id", user.id)
        .single();
      if (data?.household_id) {
        setHouseholdId(data.household_id);
        fetchMessages(data.household_id);
      } else {
        setIsLoading(false);
      }
    };
    initChat();
  }, [user]);

  // 2. Fetch history and listen to real-time changes
  const fetchMessages = async (hId: string) => {
    const { data } = await supabase
      .from("messages")
      .select("*, profiles(full_name)")
      .eq("household_id", hId)
      .order("created_at", { ascending: true });

    if (data) setMessages(data);
    setIsLoading(false);

    // Subscribe to new messages
    const channel = supabase
      .channel("family_chat")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `household_id=eq.${hId}`,
        },
        () => {
          // When a new message comes in, just re-fetch the list to get the profile names attached
          fetchMessagesOnly(hId);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchMessagesOnly = async (hId: string) => {
    const { data } = await supabase
      .from("messages")
      .select("*, profiles(full_name)")
      .eq("household_id", hId)
      .order("created_at", { ascending: true });
    if (data) setMessages(data);
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !householdId || !user) return;

    const textToSend = inputText;
    setInputText(""); // Clear input instantly for better UX

    await supabase
      .from("messages")
      .insert([
        { household_id: householdId, user_id: user.id, text: textToSend },
      ]);
  };

  if (isLoading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );

  if (!householdId) {
    return (
      <View style={styles.center}>
        <Text style={styles.noFamilyText}>
          Join a household in the Profile tab to use the family chat!
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Family Hub</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        contentContainerStyle={styles.chatList}
        renderItem={({ item }) => {
          const isMe = item.user_id === user?.id;
          return (
            <View
              style={[
                styles.messageBubble,
                isMe ? styles.myMessage : styles.theirMessage,
              ]}
            >
              {!isMe && (
                <Text style={styles.senderName}>
                  {item.profiles?.full_name || "Member"}
                </Text>
              )}
              <Text
                style={[
                  styles.messageText,
                  isMe ? styles.myMessageText : styles.theirMessageText,
                ]}
              >
                {item.text}
              </Text>
            </View>
          );
        }}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Message your family..."
          placeholderTextColor={Theme.colors.textSecondary}
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Send size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const createStyles = (Theme: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: Theme.colors.background },
    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: Theme.colors.background,
      padding: 20,
    },
    noFamilyText: {
      ...Theme.typography.body,
      textAlign: "center",
      color: Theme.colors.textSecondary,
    },
    header: {
      paddingTop: 60,
      paddingBottom: 15,
      backgroundColor: Theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: Theme.colors.border,
      alignItems: "center",
    },
    headerTitle: { ...Theme.typography.screenTitle, fontSize: 18 },

    chatList: { padding: 16, flexGrow: 1, justifyContent: "flex-end" },
    messageBubble: {
      maxWidth: "80%",
      padding: 12,
      borderRadius: 16,
      marginBottom: 12,
    },
    myMessage: {
      alignSelf: "flex-end",
      backgroundColor: Theme.colors.primary,
      borderBottomRightRadius: 4,
    },
    theirMessage: {
      alignSelf: "flex-start",
      backgroundColor: Theme.colors.surface,
      borderBottomLeftRadius: 4,
      borderWidth: 1,
      borderColor: Theme.colors.border,
    },

    senderName: {
      fontSize: 12,
      color: Theme.colors.primary,
      fontWeight: "600",
      marginBottom: 4,
    },
    messageText: { fontSize: 15, lineHeight: 20 },
    myMessageText: { color: "#FFFFFF" },
    theirMessageText: { color: Theme.colors.textPrimary },

    inputContainer: {
      flexDirection: "row",
      padding: 16,
      backgroundColor: Theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: Theme.colors.border,
      alignItems: "center",
    },
    input: {
      flex: 1,
      backgroundColor: Theme.colors.background,
      borderWidth: 1,
      borderColor: Theme.colors.border,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 12,
      fontSize: 16,
      color: Theme.colors.textPrimary,
      marginRight: 12,
    },
    sendButton: {
      backgroundColor: Theme.colors.primary,
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: "center",
      alignItems: "center",
    },
  });
