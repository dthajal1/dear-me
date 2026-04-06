import { Pressable, Text } from "react-native";
import { BlurView } from "expo-blur";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import type { LucideIcon } from "lucide-react-native";

interface PrimaryButtonProps {
  label: string;
  icon?: LucideIcon;
  onPress?: () => void;
  fullWidth?: boolean;
  variant?: "filled" | "outline" | "ghost";
}

export function PrimaryButton({
  label,
  icon: Icon,
  onPress,
  fullWidth = true,
  variant = "filled",
}: PrimaryButtonProps) {
  const isFilled = variant === "filled";
  const isOutline = variant === "outline";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        borderRadius: 14,
        overflow: "hidden",
        opacity: pressed ? 0.85 : 1,
        ...(fullWidth && { width: "100%" as const }),
        ...(isOutline && {
          borderWidth: 1,
          borderColor: Colors.accentBorderFaint,
        }),
      })}
    >
      <BlurView
        intensity={isFilled ? 12 : 0}
        tint="dark"
        style={{
          backgroundColor: isFilled ? Colors.primaryMuted : Colors.accentBgLight,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 14,
          paddingHorizontal: 32,
          gap: 10,
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        {Icon && (
          <Icon
            size={18}
            color={isFilled ? Colors.white : Colors.primaryLight}
          />
        )}
        <Text
          style={{
            fontFamily: Typography.family.sans,
            fontSize: Typography.size.lg,
            fontWeight: Typography.weight.semibold,
            color: isFilled ? Colors.white : Colors.primaryLight,
          }}
        >
          {label}
        </Text>
      </BlurView>
    </Pressable>
  );
}
