import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Keyboard,
} from "react-native";
import {
  Play,
  Pause,
  RotateCcw,
  Minus,
  Plus,
  Check,
  Pencil,
} from "lucide-react-native";
import { Theme } from "../../core/theme";
import { useTimerStore } from "./hooks/useTimerStore";

const PRESETS = [
  { label: "Tea / Boil", seconds: 5 * 60 },
  { label: "Oven Bake", seconds: 15 * 60 },
  { label: "Kitchen Sprint", seconds: 20 * 60 },
  { label: "Deep Clean", seconds: 45 * 60 },
];

export const TimerScreen = () => {
  const {
    remainingSeconds,
    initialDuration,
    isRunning,
    activeLabel,
    setPreset,
    startTimer,
    pauseTimer,
    resetTimer,
    completeTimerEarly,
    tick,
    adjustTime,
    setActiveLabel,
    setExactTime,
  } = useTimerStore();

  const [isEditingTime, setIsEditingTime] = useState(false);
  const [inputMins, setInputMins] = useState("");
  const [inputSecs, setInputSecs] = useState("");

  const isUrgent = isRunning && remainingSeconds <= 60 && remainingSeconds > 0;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      setIsEditingTime(false);
      interval = setInterval(() => tick(), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, tick]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOpenEditTime = () => {
    if (isRunning) return;
    setInputMins(Math.floor(remainingSeconds / 60).toString());
    setInputSecs((remainingSeconds % 60).toString());
    setIsEditingTime(true);
  };

  // Saves the time manually if they click the checkmark
  const handleSaveTime = () => {
    const m = parseInt(inputMins) || 0;
    const s = parseInt(inputSecs) || 0;
    const total = m * 60 + s > 0 ? m * 60 + s : 60; // Default to 1 min if they type 00:00
    setExactTime(total);
    setIsEditingTime(false);
    Keyboard.dismiss();
  };

  // NEW: Automatically saves the typed time if they hit Start directly
  const handleStart = () => {
    if (isEditingTime) {
      const m = parseInt(inputMins) || 0;
      const s = parseInt(inputSecs) || 0;
      const total = m * 60 + s > 0 ? m * 60 + s : 60;
      setExactTime(total);
      setIsEditingTime(false);
      Keyboard.dismiss();
    }
    startTimer();
  };

  const progressPercentage = Math.round(
    ((initialDuration - remainingSeconds) / (initialDuration || 1)) * 100,
  );

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={1}
      onPress={() => {
        Keyboard.dismiss();
        if (isEditingTime) handleSaveTime();
      }}
    >
      <View style={styles.header}>
        <Text style={Theme.typography.screenTitle}>Chore & Cooking Timer</Text>
        <Text style={styles.subtitle}>
          Alerts and countdowns shared across the home.
        </Text>
      </View>

      <View style={[styles.timerCard, isUrgent && styles.timerCardUrgent]}>
        <View style={styles.editableLabelContainer}>
          <TextInput
            style={[
              styles.timerLabelInput,
              isUrgent && { color: Theme.colors.danger },
            ]}
            value={activeLabel}
            onChangeText={setActiveLabel}
            placeholder="Name your task..."
            placeholderTextColor={Theme.colors.textSecondary}
            maxLength={40}
            returnKeyType="done"
            onSubmitEditing={Keyboard.dismiss}
          />
          <Pencil
            size={12}
            color={isUrgent ? Theme.colors.danger : Theme.colors.primary}
            style={styles.pencilIcon}
          />
        </View>

        <View style={styles.timeAdjustmentRow}>
          {!isEditingTime && (
            <TouchableOpacity
              onPress={() => adjustTime(-300)}
              style={styles.adjustButton}
            >
              <Minus size={20} color={Theme.colors.textSecondary} />
              <Text style={styles.adjustText}>5m</Text>
            </TouchableOpacity>
          )}

          {isEditingTime ? (
            <View style={styles.editTimeContainer}>
              <TextInput
                style={styles.timeInput}
                keyboardType="number-pad"
                value={inputMins}
                onChangeText={setInputMins}
                maxLength={3}
                selectTextOnFocus
                autoFocus
              />
              <Text style={styles.timeColon}>:</Text>
              <TextInput
                style={styles.timeInput}
                keyboardType="number-pad"
                value={inputSecs}
                onChangeText={setInputSecs}
                maxLength={2}
                selectTextOnFocus
              />
              <TouchableOpacity
                onPress={handleSaveTime}
                style={styles.saveTimeBtn}
              >
                <Check size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleOpenEditTime}
              activeOpacity={0.7}
              disabled={isRunning}
            >
              <Text
                style={[
                  styles.clockDigits,
                  isRunning && { opacity: 0.8 },
                  isUrgent && { color: Theme.colors.danger },
                ]}
              >
                {formatTime(remainingSeconds)}
              </Text>
            </TouchableOpacity>
          )}

          {!isEditingTime && (
            <TouchableOpacity
              onPress={() => adjustTime(300)}
              style={styles.adjustButton}
            >
              <Plus size={20} color={Theme.colors.textSecondary} />
              <Text style={styles.adjustText}>5m</Text>
            </TouchableOpacity>
          )}
        </View>

        {!isEditingTime && (
          <Text
            style={[
              styles.progressText,
              isUrgent && { color: Theme.colors.danger },
            ]}
          >
            {isUrgent
              ? "Hurry! Final minute!"
              : isRunning
                ? "Ticking down..."
                : "Tap the time to edit exact minutes"}
          </Text>
        )}

        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[styles.primaryButton, isRunning && styles.pauseButton]}
            onPress={isRunning ? pauseTimer : handleStart}
          >
            {isRunning ? (
              <Pause size={18} color="#FFFFFF" />
            ) : (
              <Play size={18} color="#FFFFFF" style={{ marginLeft: 2 }} />
            )}
            <Text style={styles.buttonText}>
              {isRunning ? "Pause" : "Start"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.doneButton}
            onPress={completeTimerEarly}
          >
            <Check size={18} color="#FFFFFF" />
            <Text style={styles.buttonText}>Done</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={resetTimer}>
            <RotateCcw size={18} color={Theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={[Theme.typography.sectionTitle, styles.sectionHeader]}>
        Quick Presets
      </Text>
      <View style={styles.presetsGrid}>
        {PRESETS.map((p) => {
          const isSelected = activeLabel === p.label;
          return (
            <TouchableOpacity
              key={p.label}
              style={[styles.presetCard, isSelected && styles.presetCardActive]}
              onPress={() => setPreset(p.seconds, p.label)}
            >
              <Text
                style={[
                  styles.presetText,
                  isSelected && styles.presetTextActive,
                ]}
              >
                {p.label}
              </Text>
              <Text
                style={[
                  styles.presetTime,
                  isSelected && styles.presetTimeActive,
                ]}
              >
                {Math.floor(p.seconds / 60)} min
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    paddingHorizontal: Theme.spacing.md,
    paddingTop: 60,
  },
  header: { marginBottom: Theme.spacing.md },
  subtitle: { ...Theme.typography.caption, marginTop: Theme.spacing.xs },

  timerCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radii.lg,
    paddingVertical: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  timerCardUrgent: {
    borderColor: Theme.colors.danger,
    backgroundColor: "#FFF5F5",
  },

  editableLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 4,
    borderRadius: Theme.radii.sm,
    backgroundColor: Theme.colors.background,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  timerLabelInput: {
    ...Theme.typography.caption,
    fontWeight: "700",
    color: Theme.colors.primary,
    textTransform: "uppercase",
    letterSpacing: 1,
    textAlign: "center",
    minWidth: 140,
  },
  pencilIcon: { marginLeft: 6, opacity: 0.6 },

  timeAdjustmentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Theme.spacing.md,
    marginVertical: Theme.spacing.xs,
    minHeight: 60,
  },
  adjustButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 44,
    height: 44,
    borderRadius: Theme.radii.full,
    backgroundColor: Theme.colors.background,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  adjustText: {
    fontSize: 10,
    fontWeight: "700",
    color: Theme.colors.textSecondary,
    marginTop: -2,
  },
  clockDigits: {
    ...Theme.typography.timerDisplay,
    color: Theme.colors.textPrimary,
  },

  editTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.radii.md,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
  },
  timeInput: {
    fontSize: 36,
    fontWeight: "700",
    color: Theme.colors.textPrimary,
    textAlign: "center",
    minWidth: 50,
  },
  timeColon: {
    fontSize: 32,
    fontWeight: "700",
    color: Theme.colors.textSecondary,
    marginHorizontal: 4,
    marginBottom: 6,
  },
  saveTimeBtn: {
    marginLeft: Theme.spacing.md,
    backgroundColor: Theme.colors.primary,
    width: 36,
    height: 36,
    borderRadius: Theme.radii.full,
    alignItems: "center",
    justifyContent: "center",
  },

  progressText: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.md,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Theme.spacing.sm,
    width: "100%",
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: Theme.radii.full,
    flex: 1,
  },
  pauseButton: { backgroundColor: Theme.colors.accent },
  doneButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Theme.colors.success,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: Theme.radii.full,
    flex: 1,
  },
  buttonText: { color: "#FFFFFF", fontWeight: "600", fontSize: 14 },
  secondaryButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Theme.colors.background,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: Theme.radii.full,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  sectionHeader: {
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.sm,
  },
  presetsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Theme.spacing.sm,
  },
  presetCard: {
    flex: 1,
    minWidth: "47%",
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.md,
    borderRadius: Theme.radii.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  presetCardActive: {
    borderColor: Theme.colors.primary,
    backgroundColor: Theme.colors.primaryLight,
  },
  presetText: {
    fontWeight: "600",
    fontSize: 14,
    color: Theme.colors.textPrimary,
  },
  presetTextActive: { color: Theme.colors.primary },
  presetTime: { ...Theme.typography.caption, marginTop: 4 },
  presetTimeActive: { color: Theme.colors.primary },
});
