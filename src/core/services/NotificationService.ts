import { Alert } from "react-native";
import * as Haptics from "expo-haptics";

export const NotificationService = {
  async registerForPushNotifications(): Promise<string | null> {
    console.log("Push notifications disabled in Expo Go.");
    return null;
  },

  async scheduleTimerAlarm(
    title: string,
    secondsFromNow: number,
  ): Promise<string> {
    setTimeout(() => {
      this.playTingSound();
      Alert.alert(
        `!!! Household Alert: ${title}`,
        `The timer for "${title}" has completed!`,
        [{ text: "Dismiss", style: "cancel" }],
      );
    }, secondsFromNow * 1000);

    return "mock-notification-id";
  },

  async notifyOneMinuteWarning(title: string): Promise<void> {
    Alert.alert(
      `⏳ Hurry up!`,
      `Less than 1 minute remaining for "${title}". Tap 'Done' to silence the alarm for everyone.`,
      [{ text: "Understood", style: "default" }],
    );
  },

  // 🎵 Replaced native audio with a heavy Haptic feedback pattern for Expo Go
  async playTingSound(): Promise<void> {
    console.log("🎵 [Network Chime Triggered]");
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },

  async notifyTimerCompletedEarly(title: string): Promise<void> {
    await this.playTingSound();

    Alert.alert(
      `✅ Task Completed!`,
      `Someone in the household just finished "${title}". The timer has been stopped.`,
      [{ text: "Awesome!", style: "default" }],
    );
  },

  async cancelAlarm(notificationId: string): Promise<void> {
    // Mock cancellation
  },
};
