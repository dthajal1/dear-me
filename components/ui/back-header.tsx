import { Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";

interface BackHeaderProps {
  title: string;
  onPress?: () => void;
}

export function BackHeader({ title, onPress }: BackHeaderProps) {
  const router = useRouter();

  return (
    <Pressable
      onPress={onPress ?? (() => router.back())}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
      }}
    >
      <ArrowLeft size={20} color={Colors.textPrimary} />
      <Text
        style={{
          fontFamily: Typography.family.sans,
          fontSize: Typography.size["2xl"],
          fontWeight: Typography.weight.bold,
          color: Colors.textPrimary,
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
}
