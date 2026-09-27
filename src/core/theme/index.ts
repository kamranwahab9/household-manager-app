import { useThemeStore } from "../useThemeStore";

const lightColors = {
  background: "#F8F9FA",
  surface: "#FFFFFF",
  primary: "#1E6F5C",
  primaryLight: "#E8F3EE",
  accent: "#F2994A",
  textPrimary: "#1F2937",
  textSecondary: "#6B7280",
  border: "rgba(0, 0, 0, 0.08)",
  success: "#10B981",
  danger: "#EF4444",
};

const darkColors = {
  background: "#121212", // Deep dark background
  surface: "#1E1E1E", // Slightly lighter elevated cards
  primary: "#2EA88C", // Brightened sage/teal for dark mode contrast
  primaryLight: "rgba(46, 168, 140, 0.15)",
  accent: "#F2994A", // Kept warm amber
  textPrimary: "#F9FAFB", // High-contrast off-white
  textSecondary: "#9CA3AF", // Soft gray for subtitles
  border: "rgba(255, 255, 255, 0.1)",
  success: "#34D399",
  danger: "#F87171",
};

const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
const radii = { sm: 8, md: 12, lg: 20, full: 9999 };

// Dynamic Hook for updated screens (like Profile)
export const useAppTheme = () => {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const colors = isDarkMode ? darkColors : lightColors;

  return {
    colors,
    spacing,
    radii,
    typography: {
      timerDisplay: {
        fontSize: 48,
        fontWeight: "700" as const,
        letterSpacing: -1,
        color: colors.textPrimary,
      },
      screenTitle: {
        fontSize: 24,
        fontWeight: "700" as const,
        color: colors.textPrimary,
      },
      sectionTitle: {
        fontSize: 18,
        fontWeight: "600" as const,
        color: colors.textPrimary,
      },
      body: {
        fontSize: 15,
        fontWeight: "400" as const,
        color: colors.textPrimary,
      },
      caption: {
        fontSize: 12,
        fontWeight: "500" as const,
        color: colors.textSecondary,
      },
    },
  };
};

// Static fallback matching your original light theme for un-updated screens
export const Theme = {
  colors: lightColors,
  spacing,
  radii,
  typography: {
    timerDisplay: {
      fontSize: 48,
      fontWeight: "700" as const,
      letterSpacing: -1,
      color: lightColors.textPrimary,
    },
    screenTitle: {
      fontSize: 24,
      fontWeight: "700" as const,
      color: lightColors.textPrimary,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600" as const,
      color: lightColors.textPrimary,
    },
    body: {
      fontSize: 15,
      fontWeight: "400" as const,
      color: lightColors.textPrimary,
    },
    caption: {
      fontSize: 12,
      fontWeight: "500" as const,
      color: lightColors.textSecondary,
    },
  },
};
