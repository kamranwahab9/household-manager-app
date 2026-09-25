import { create } from "zustand";
import * as Haptics from "expo-haptics";
import { NotificationService } from "../../../core/services/NotificationService";
import { supabase } from "../../../core/services/supabase";

interface TimerState {
  initialDuration: number;
  remainingSeconds: number;
  isRunning: boolean;
  activeLabel: string;
  activeNotificationId: string | null;

  setPreset: (seconds: number, label: string) => void;
  setChoreTimer: (title: string, defaultMinutes?: number) => void;
  setActiveLabel: (label: string) => void;
  adjustTime: (seconds: number) => void;
  setExactTime: (seconds: number) => void;
  startTimer: () => Promise<void>;
  pauseTimer: () => Promise<void>;
  resetTimer: () => Promise<void>;
  completeTimerEarly: () => Promise<void>;
  tick: () => void;
}

// 1. Establish the shared household radio channel
const householdChannel = supabase.channel("household-timers");

export const useTimerStore = create<TimerState>((set, get) => {
  // 2. Listen for the broadcast from OTHER phones
  householdChannel
    .on("broadcast", { event: "TASK_DONE" }, async (payload) => {
      const { activeNotificationId } = get();
      if (activeNotificationId)
        await NotificationService.cancelAlarm(activeNotificationId);

      set({
        remainingSeconds: 0,
        isRunning: false,
        activeNotificationId: null,
      });

      // Play the chime locally because someone else finished it
      await NotificationService.notifyTimerCompletedEarly(
        payload.payload.title,
      );
    })
    .subscribe();

  return {
    initialDuration: 25 * 60,
    remainingSeconds: 25 * 60,
    isRunning: false,
    activeLabel: "Quick Kitchen Sprint",
    activeNotificationId: null,

    setPreset: (seconds, label) => {
      Haptics.selectionAsync();
      set({
        initialDuration: seconds,
        remainingSeconds: seconds,
        isRunning: false,
        activeLabel: label,
      });
    },

    setChoreTimer: (title, defaultMinutes = 15) => {
      Haptics.selectionAsync();
      const seconds = defaultMinutes * 60;
      set({
        initialDuration: seconds,
        remainingSeconds: seconds,
        isRunning: false,
        activeLabel: title,
      });
    },

    setActiveLabel: (label) => {
      set({ activeLabel: label });
    },

    adjustTime: (seconds) => {
      Haptics.selectionAsync();
      set((state) => {
        const newSeconds = Math.max(0, state.remainingSeconds + seconds);
        return {
          initialDuration: state.isRunning ? state.initialDuration : newSeconds,
          remainingSeconds: newSeconds,
        };
      });
    },

    setExactTime: (seconds) => {
      Haptics.selectionAsync();
      set({
        initialDuration: seconds,
        remainingSeconds: seconds,
        isRunning: false,
      });
    },

    startTimer: async () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const { remainingSeconds, activeLabel } = get();
      const notificationId = await NotificationService.scheduleTimerAlarm(
        activeLabel,
        remainingSeconds,
      );
      set({ isRunning: true, activeNotificationId: notificationId });
    },

    pauseTimer: async () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const { activeNotificationId } = get();
      if (activeNotificationId)
        await NotificationService.cancelAlarm(activeNotificationId);
      set({ isRunning: false, activeNotificationId: null });
    },

    resetTimer: async () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      const { initialDuration, activeNotificationId } = get();
      if (activeNotificationId)
        await NotificationService.cancelAlarm(activeNotificationId);
      set({
        remainingSeconds: initialDuration,
        isRunning: false,
        activeNotificationId: null,
      });
    },

    // 3. Blast the broadcast to ALL phones when you hit Done
    completeTimerEarly: async () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const { activeNotificationId, activeLabel } = get();

      if (activeNotificationId)
        await NotificationService.cancelAlarm(activeNotificationId);
      set({
        remainingSeconds: 0,
        isRunning: false,
        activeNotificationId: null,
      });

      // Play local sound on your phone
      await NotificationService.notifyTimerCompletedEarly(activeLabel);

      // Send the invisible ping over the network
      householdChannel.send({
        type: "broadcast",
        event: "TASK_DONE",
        payload: { title: activeLabel },
      });
    },

    tick: () => {
      const { remainingSeconds, isRunning, activeLabel } = get();
      if (!isRunning) return;

      if (remainingSeconds === 60) {
        NotificationService.notifyOneMinuteWarning(activeLabel);
      }

      if (
        remainingSeconds <= 60 &&
        remainingSeconds > 1 &&
        remainingSeconds % 2 === 0
      ) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }

      if (remainingSeconds <= 1) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        set({
          remainingSeconds: 0,
          isRunning: false,
          activeNotificationId: null,
        });
      } else {
        set({ remainingSeconds: remainingSeconds - 1 });
      }
    },
  };
});
