import { View, Text, ScrollView } from "react-native";
import { Image } from "@/src/tw/image";
import { Play, Clock } from "lucide-react-native";
import { ScreenBackground } from "@/components/ui/screen-background";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { STREAK_MEMOS } from "@/constants/mock-data";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function StreakDayScreen() {
  const insets = useSafeAreaInsets();

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
            Wednesday, March 26
          </Text>
          <Text
            style={{
              fontFamily: Typography.family.sans,
              fontSize: Typography.size.base,
              color: Colors.secondaryText,
            }}
          >
            3 memos recorded
          </Text>
        </View>

        {/* Memo list */}
        <View style={{ gap: 20 }}>
          {STREAK_MEMOS.map((memo, index) => (
            <View
              key={memo.id}
              style={{
                gap: 12,
                paddingBottom: index < STREAK_MEMOS.length - 1 ? 20 : 0,
                ...(index < STREAK_MEMOS.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: Colors.accentBorderLight,
                }),
              }}
            >
              {/* Time + duration */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: Typography.family.sans,
                    fontSize: Typography.size.xl,
                    fontWeight: Typography.weight.semibold,
                    color: Colors.textPrimary,
                  }}
                >
                  {memo.time}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Clock size={12} color={Colors.textMuted} />
                  <Text
                    style={{
                      fontFamily: Typography.family.sans,
                      fontSize: Typography.size.md,
                      color: Colors.textMuted,
                    }}
                  >
                    {memo.duration}
                  </Text>
                </View>
              </View>

              {/* Thumbnail + transcript */}
              <View style={{ flexDirection: "row", gap: 12 }}>
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 12,
                    overflow: "hidden",
                    backgroundColor: Colors.accentBgLight,
                  }}
                >
                  {memo.thumbnailUrl && (
                    <Image
                      source={memo.thumbnailUrl}
                      style={{ width: 80, height: 80 }}
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
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: "#FFFFFF99",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Play
                        size={12}
                        color={Colors.primary}
                        fill={Colors.primary}
                      />
                    </View>
                  </View>
                </View>

                <View style={{ flex: 1, gap: 8 }}>
                  <Text
                    numberOfLines={3}
                    style={{
                      fontFamily: Typography.family.sans,
                      fontSize: Typography.size.base,
                      color: Colors.textPrimary,
                      lineHeight: 20,
                      fontStyle: "italic",
                    }}
                  >
                    {memo.transcript}
                  </Text>
                </View>
              </View>

              {/* Mood tags */}
              <View
                style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}
              >
                {memo.moods.map((mood) => (
                  <View
                    key={mood}
                    style={{
                      paddingVertical: 4,
                      paddingHorizontal: 10,
                      borderRadius: 10,
                      backgroundColor: Colors.accentBgLight,
                      borderWidth: 1,
                      borderColor: Colors.accentBorderFaint,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: Typography.family.sans,
                        fontSize: Typography.size.xs,
                        fontWeight: Typography.weight.medium,
                        color: Colors.secondaryText,
                      }}
                    >
                      {mood}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}
