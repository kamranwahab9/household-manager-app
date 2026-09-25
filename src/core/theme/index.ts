export const Theme = {
  colors: {
    background: "#F8F9FA", // Soft off-white to prevent eye strain
    surface: "#FFFFFF", // Crisp card surfaces
    primary: "#1E6F5C", // Deep sage / forest teal (calm & focused)
    primaryLight: "#E8F3EE",
    accent: "#F2994A", // Warm amber for active countdowns & alerts
    textPrimary: "#1F2937", // High-contrast readable charcoal
    textSecondary: "#6B7280", // Timestamps and subtitles
    border: "rgba(0, 0, 0, 0.08)",
    success: "#10B981",
    danger: "#EF4444",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radii: {
    sm: 8,
    md: 12,
    lg: 20,
    full: 9999,
  },
  typography: {
    timerDisplay: {
      fontSize: 48,
      fontWeight: "700" as const,
      letterSpacing: -1,
    },
    screenTitle: {
      fontSize: 24,
      fontWeight: "700" as const,
      color: "#1F2937",
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600" as const,
      color: "#1F2937",
    },
    body: {
      fontSize: 15,
      fontWeight: "400" as const,
      color: "#1F2937",
    },
    caption: {
      fontSize: 12,
      fontWeight: "500" as const,
      color: "#6B7280",
    },
  },
};
