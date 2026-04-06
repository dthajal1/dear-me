import { Pressable, Text } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";

interface BackPillProps {
  label?: string;
  onPress?: () => void;
}

export function BackPill({ label = "Back", onPress }: BackPillProps) {
  const router = useRouter();

  return (
    <Pressable
      onPress={onPress ?? (() => router.back())}
      style={({ pressed }) => ({
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        backgroundColor: Colors.accentBg,
        borderWidth: 1,
        borderColor: Colors.accentBorderLight,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <ArrowLeft size={18} color={Colors.textPrimary} />
      <Text
        style={{
          fontFamily: Typography.family.sans,
          fontSize: Typography.size.base,
          fontWeight: Typography.weight.medium,
          color: Colors.textPrimary,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
