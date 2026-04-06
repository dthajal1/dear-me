import { useEffect } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { Leaf } from "lucide-react-native";
import { ScreenBackground } from "@/components/ui/screen-background";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProcessingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/record/saved");
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <ScreenBackground>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          gap: 24,
          paddingTop: insets.top,
        }}
      >
        {/* Animated circle with leaf */}
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          {/* Outer glow rings */}
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
                <Leaf size={28} color={Colors.white} />
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
          Sitting with your words...
        </Text>

        <Text
          style={{
            fontFamily: Typography.family.sans,
            fontSize: Typography.size.base,
            color: Colors.secondaryText,
          }}
        >
          listening carefully
        </Text>

        {/* Progress bar */}
        <View
          style={{
            width: 120,
            height: 4,
            borderRadius: 2,
            backgroundColor: Colors.accentBgLight,
            marginTop: 8,
          }}
        >
          <View
            style={{
              width: "60%",
              height: 4,
              borderRadius: 2,
              backgroundColor: Colors.primary,
            }}
          />
        </View>
      </View>
    </ScreenBackground>
  );
}
