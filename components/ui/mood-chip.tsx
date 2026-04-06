import { Text, Pressable } from "react-native";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";

interface MoodChipProps {
  emoji: string;
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

export function MoodChip({ emoji, label, selected, onPress }: MoodChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        alignItems: "center",
        gap: 4,
        paddingVertical: 6,
        paddingHorizontal: 2,
        borderRadius: 12,
        backgroundColor: selected ? Colors.primaryLight : Colors.accentBg,
        borderWidth: 1,
        borderColor: selected ? Colors.primary : Colors.accentBorderLight,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text style={{ fontSize: 20 }}>{emoji}</Text>
      <Text
        style={{
          fontFamily: Typography.family.sans,
          fontSize: Typography.size.sm,
          fontWeight: Typography.weight.medium,
          color: selected ? Colors.white : Colors.secondaryText,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
