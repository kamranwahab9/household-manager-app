import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

// This tells the app to show the alert even if you currently have the app open
Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    } as Notifications.NotificationBehavior;
  },
});

export async function setupNotifications() {
  if (!Device.isDevice) {
    console.log("Must use a physical device for Push Notifications");
    return false;
  }

  // Android requires a specific channel for notifications to show up
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return false;
  }

  return true;
}

export async function scheduleBillReminder(title: string, dateString: string) {
  // For testing right now, this triggers exactly 5 seconds after you add the bill.
  // We will change this to "24 hours before due date" once we confirm it works!
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Bill Reminder 📝",
      body: `Your ${title} bill is due soon!`,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 5,
    },
  });
}
