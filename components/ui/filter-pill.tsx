import { Pressable, Text } from "react-native";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";

interface FilterPillProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
}

export function FilterPill({ label, active, onPress }: FilterPillProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 16,
        backgroundColor: active ? Colors.primaryLight : Colors.accentBgLight,
        ...(active
          ? {}
          : {
              borderWidth: 1,
              borderColor: Colors.accentBorderFaint,
            }),
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text
        style={{
          fontFamily: Typography.family.sans,
          fontSize: Typography.size.md,
          fontWeight: active ? Typography.weight.semibold : Typography.weight.medium,
          color: active ? Colors.white : Colors.secondaryText,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
