import { View, Text } from "react-native";
import { Lock } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";

export function PrivacyNote() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <Lock size={12} color={Colors.secondaryFaint} />
      <Text
        style={{
          fontFamily: Typography.family.sans,
          fontSize: Typography.size.sm,
          color: Colors.secondaryFaint,
        }}
      >
        Your memos are private & on-device
      </Text>
    </View>
  );
}
