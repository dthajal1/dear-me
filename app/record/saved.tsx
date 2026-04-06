import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { Check } from "lucide-react-native";
import { ScreenBackground } from "@/components/ui/screen-background";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SavedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <ScreenBackground>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          gap: 20,
          paddingHorizontal: 40,
          paddingTop: insets.top,
        }}
      >
        {/* Success circle */}
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <View
            style={{
              width: 160,
              height: 160,
              borderRadius: 80,
              backgroundColor: Colors.accentBgFaint,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: Colors.accentBgLight,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: Colors.primaryMuted,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Check size={32} color={Colors.white} strokeWidth={3} />
              </View>
            </View>
          </View>
        </View>

        <Text
          style={{
            fontFamily: Typography.family.sans,
            fontSize: Typography.size["4xl"],
            fontWeight: Typography.weight.bold,
            color: Colors.textPrimary,
          }}
        >
          Safely kept.
        </Text>

        <Text
          style={{
            fontFamily: Typography.family.sans,
            fontSize: Typography.size.base,
            color: Colors.secondaryText,
          }}
        >
          {"We'll hold onto it for you."}
        </Text>
      </View>

      {/* Bottom button */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <PrimaryButton
          label="Done"
          onPress={() => router.navigate("/")}
        />
      </View>
    </ScreenBackground>
  );
}
