import { View, Text, Pressable } from "react-native";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import type { LucideIcon } from "lucide-react-native";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  actionLabel?: string;
  actionIcon?: LucideIcon;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  subtitle,
  actionLabel,
  actionIcon: ActionIcon,
  onAction,
}: EmptyStateProps) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 20,
        paddingHorizontal: 40,
      }}
    >
      {/* Circle icon */}
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: Colors.accentBgFaint,
          borderWidth: 1,
          borderColor: Colors.accentBgSubtle,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={32} color={Colors.primarySubtle} />
      </View>

      <Text
        style={{
          fontFamily: Typography.family.sans,
          fontSize: Typography.size["3xl"],
          fontWeight: Typography.weight.bold,
          color: Colors.textPrimary,
          textAlign: "center",
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          fontFamily: Typography.family.sans,
          fontSize: Typography.size.base,
          color: Colors.secondaryText,
          textAlign: "center",
          lineHeight: 21,
        }}
      >
        {subtitle}
      </Text>

      {actionLabel && (
        <Pressable
          onPress={onAction}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 10,
            backgroundColor: Colors.accentBgLight,
            borderWidth: 1,
            borderColor: Colors.accentBorderFaint,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          {ActionIcon && <ActionIcon size={16} color={Colors.primaryLight} />}
          <Text
            style={{
              fontFamily: Typography.family.sans,
              fontSize: Typography.size.base,
              fontWeight: Typography.weight.medium,
              color: Colors.primaryLight,
            }}
          >
            {actionLabel}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
