import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "@/src/tw/image";
import { Play, Clock, Heart } from "lucide-react-native";
import { ScreenBackground } from "@/components/ui/screen-background";
import { PrimaryButton } from "@/components/ui/primary-button";
import { GlassCard } from "@/components/ui/glass-card";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { MOCK_MEMOS } from "@/constants/mock-data";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MemoPlaybackScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const memo = MOCK_MEMOS[1];

  return (
    <ScreenBackground>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingBottom: insets.bottom + 20,
          paddingHorizontal: 20,
          gap: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Date header */}
        <View style={{ gap: 4 }}>
          <Text
            style={{
              fontFamily: Typography.family.sans,
              fontSize: Typography.size["4xl"],
              fontWeight: Typography.weight.bold,
              color: Colors.textPrimary,
            }}
          >
            March 23, 2026
          </Text>
          <Text
            style={{
              fontFamily: Typography.family.sans,
              fontSize: Typography.size.base,
              color: Colors.secondaryText,
            }}
          >
            9:15 AM
          </Text>
        </View>

        {/* Video */}
        <View
          style={{
            borderRadius: 16,
            overflow: "hidden",
            height: 220,
            backgroundColor: Colors.accentBgLight,
          }}
        >
          {memo?.thumbnailUrl && (
            <Image
              source={memo.thumbnailUrl}
              style={{ width: "100%", height: 220 }}
              contentFit="cover"
            />
          )}
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
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: "#FFFFFF99",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Play size={20} color={Colors.primary} fill={Colors.primary} />
            </View>
          </View>
          <View
            style={{
              position: "absolute",
              bottom: 10,
              right: 10,
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              backgroundColor: "#00000066",
              paddingVertical: 4,
              paddingHorizontal: 8,
              borderRadius: 8,
            }}
          >
            <Clock size={10} color={Colors.white} />
            <Text style={{ fontSize: 11, color: Colors.white }}>0:42</Text>
          </View>
        </View>

        {/* Mood tags */}
        <View style={{ flexDirection: "row", gap: 8 }}>
          {["calm", "grounded", "hopeful"].map((mood) => (
            <View
              key={mood}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 14,
                borderRadius: 12,
                backgroundColor: Colors.accentBgLight,
                borderWidth: 1,
                borderColor: Colors.accentBorderFaint,
              }}
            >
              <Text
                style={{
                  fontFamily: Typography.family.sans,
                  fontSize: Typography.size.md,
                  fontWeight: Typography.weight.medium,
                  color: Colors.secondaryText,
                }}
              >
                {mood}
              </Text>
            </View>
          ))}
        </View>

        {/* Transcript */}
        <GlassCard>
          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={{ fontSize: 14 }}>{"📝"}</Text>
              <Text
                style={{
                  fontFamily: Typography.family.sans,
                  fontSize: Typography.size.lg,
                  fontWeight: Typography.weight.semibold,
                  color: Colors.textPrimary,
                }}
              >
                Transcript
              </Text>
            </View>
            <Text
              selectable
              style={{
                fontFamily: Typography.family.sans,
                fontSize: Typography.size.base,
                color: Colors.textPrimary,
                lineHeight: 22,
                fontStyle: "italic",
              }}
            >
              {"\"I remember feeling like everything was piling up... but it worked out. I just had to take it one day at a time.\""}
            </Text>
          </View>
        </GlassCard>

        {/* AI gentle reminder */}
        <View
          style={{
            backgroundColor: "#F5F8ED",
            borderRadius: 14,
            padding: 16,
            borderLeftWidth: 3,
            borderLeftColor: Colors.primary,
            gap: 6,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={{ fontSize: 13 }}>{"🌿"}</Text>
            <Text
              style={{
                fontFamily: Typography.family.sans,
                fontSize: Typography.size.md,
                fontWeight: Typography.weight.semibold,
                color: Colors.primary,
              }}
            >
              A gentle reminder
            </Text>
          </View>
          <Text
            style={{
              fontFamily: Typography.family.sans,
              fontSize: Typography.size.base,
              color: Colors.primary,
              fontStyle: "italic",
              lineHeight: 21,
            }}
          >
            {"You found your calm that day. The heaviness you feel now — you've carried it before, and you always find your way back."}
          </Text>
        </View>

        {/* I needed this button */}
        <PrimaryButton
          label="I needed this"
          icon={Heart}
          onPress={() => router.navigate("/")}
        />
      </ScrollView>
    </ScreenBackground>
  );
}
