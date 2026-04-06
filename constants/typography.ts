import { Platform } from "react-native";

const geistFamily = Platform.select({
  ios: "Geist",
  android: "Geist",
  default: "Geist, system-ui, sans-serif",
});

export const Typography = {
  family: {
    sans: geistFamily,
    mono: Platform.select({
      ios: "ui-monospace",
      android: "monospace",
      default: "monospace",
    }),
  },
  size: {
    xs: 10,
    sm: 11,
    md: 13,
    base: 14,
    lg: 15,
    xl: 16,
    "2xl": 20,
    "3xl": 22,
    "4xl": 28,
  },
  weight: {
    normal: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
  },
} as const;
