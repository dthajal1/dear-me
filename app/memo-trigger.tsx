import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "@/src/tw/image";
import { Play } from "lucide-react-native";
import { ScreenBackground } from "@/components/ui/screen-background";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { MOCK_MEMOS } from "@/constants/mock-data";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MemoTriggerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const memo = MOCK_MEMOS[1]; // Use a calm memo

  return (
    <ScreenBackground>
      <View
        style={{
          flex: 1,
          paddingTop: insets.top + 16,
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 20,
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            gap: 20,
          }}
        >
          {/* Empathetic message */}
          <Text
            style={{
              fontFamily: Typography.family.sans,
              fontSize: Typography.size["4xl"],
              fontWeight: Typography.weight.bold,
              color: Colors.textPrimary,
              textAlign: "center",
              lineHeight: 36,
            }}
          >
            Hey, it sounds like things are{"\n"}heavy right now.
          </Text>

          <Text
            style={{
              fontFamily: Typography.family.sans,
              fontSize: Typography.size.base,
              color: Colors.secondaryText,
            }}
          >
            {"You've been here before."}
          </Text>

          {/* Memo suggestion card */}
          <View
            style={{
              width: "100%",
              borderRadius: 16,
              overflow: "hidden",
              backgroundColor: Colors.glassWhite,
              borderWidth: 1,
              borderColor: Colors.accentBorder,
              padding: 12,
              gap: 10,
            }}
          >
            <View
              style={{
                borderRadius: 12,
                overflow: "hidden",
                height: 180,
                backgroundColor: Colors.accentBgLight,
              }}
            >
              {memo?.thumbnailUrl && (
                <Image
                  source={memo.thumbnailUrl}
                  style={{ width: "100%", height: 180 }}
                  contentFit="cover"
                />
              )}
              {/* Play overlay */}
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: "#FFFFFF99",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Play size={18} color={Colors.primary} fill={Colors.primary} />
                </View>
              </View>
            </View>
            <Text
              style={{
                fontFamily: Typography.family.sans,
                fontSize: Typography.size.md,
                color: Colors.textMuted,
              }}
            >
              You, 2 weeks ago
            </Text>
          </View>

          {/* Listen button */}
          <PrimaryButton
            label="Listen to yourself then"
            icon={Play}
            onPress={() => router.push("/memo-playback")}
          />

          {/* Not now */}
          <Pressable
            onPress={() => router.back()}
            style={{ paddingVertical: 8 }}
          >
            <Text
              style={{
                fontFamily: Typography.family.sans,
                fontSize: Typography.size.base,
                color: Colors.textMuted,
              }}
            >
              Not now
            </Text>
          </Pressable>
        </View>
      </View>
    </ScreenBackground>
  );
}
