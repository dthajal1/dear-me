import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import {
  TrendingUp,
  Flame,
  LayoutGrid,
  Check,
} from "lucide-react-native";
import { ScreenBackground } from "@/components/ui/screen-background";
import { GlassCard } from "@/components/ui/glass-card";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { WEEKLY_DAYS } from "@/constants/mock-data";
const COMING_SOON = true;

export default function ProgressScreen() {
  const router = useRouter();

  if (COMING_SOON) {
    return (
      <ScreenBackground>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            gap: 20,
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: Colors.accentBgFaint,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TrendingUp size={32} color={Colors.primarySubtle} />
          </View>
          <Text
            style={{
              fontFamily: Typography.family.sans,
              fontSize: Typography.size["3xl"],
              fontWeight: Typography.weight.bold,
              color: Colors.textPrimary,
            }}
          >
            Coming Soon
          </Text>
          <Text
            style={{
              fontFamily: Typography.family.sans,
              fontSize: Typography.size.base,
              color: Colors.secondaryText,
              textAlign: "center",
              paddingHorizontal: 40,
              lineHeight: 21,
            }}
          >
            Streak progress tracking is on the way. Stay tuned!
          </Text>
        </View>
      </ScreenBackground>
    );
  }

  const currentDayIndex = 3; // Thursday (0-indexed)

  return (
    <ScreenBackground>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingBottom: 12,
          paddingHorizontal: 20,
          gap: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Subtitle */}
        <Text
          style={{
            fontFamily: Typography.family.sans,
            fontSize: Typography.size.base,
            color: Colors.secondaryText,
            marginTop: -4,
          }}
        >
          Your journey, day by day
        </Text>

        {/* Streak card */}
        <GlassCard>
          <View style={{ alignItems: "center", gap: 10 }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: Colors.accentBgFaint,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: Colors.accentBgSubtle,
              }}
            >
              <Flame size={22} color={Colors.primarySubtle} />
            </View>
            <Text
              style={{
                fontFamily: Typography.family.sans,
                fontSize: 48,
                fontWeight: Typography.weight.bold,
                color: Colors.textPrimary,
                fontVariant: ["tabular-nums"],
              }}
            >
              4
            </Text>
            <Text
              style={{
                fontFamily: Typography.family.sans,
                fontSize: Typography.size.base,
                color: Colors.secondaryText,
              }}
            >
              day streak
            </Text>
            {/* Progress bar */}
            <View
              style={{
                width: "100%",
                height: 6,
                borderRadius: 3,
                backgroundColor: Colors.accentBgLight,
                marginTop: 4,
              }}
            >
              <View
                style={{
                  width: "57%",
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: Colors.primary,
                }}
              />
            </View>
            <Text
              style={{
                fontFamily: Typography.family.sans,
                fontSize: Typography.size.md,
                color: Colors.secondaryText,
              }}
            >
              3 more days to reach your 7-day streak
            </Text>
          </View>
        </GlassCard>

        {/* This Week */}
        <GlassCard>
          <View style={{ gap: 14 }}>
            <Text
              style={{
                fontFamily: Typography.family.sans,
                fontSize: Typography.size.xl,
                fontWeight: Typography.weight.bold,
                color: Colors.textPrimary,
              }}
            >
              This Week
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              {WEEKLY_DAYS.map((day, i) => {
                const completed = i < currentDayIndex;
                const isToday = i === currentDayIndex;

                return (
                  <Pressable
                    key={day}
                    onPress={() => {
                      if (completed || isToday) {
                        router.push("/streak-day");
                      }
                    }}
                    style={{ alignItems: "center", gap: 8 }}
                  >
                    <Text
                      style={{
                        fontFamily: Typography.family.sans,
                        fontSize: Typography.size.sm,
                        color: Colors.textMuted,
                      }}
                    >
                      {day}
                    </Text>
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: isToday
                          ? Colors.primaryLight
                          : completed
                            ? Colors.accentBgLight
                            : "transparent",
                        borderWidth: isToday || completed ? 0 : 1,
                        borderColor: Colors.accentBorderFaint,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {completed && (
                        <Check size={16} color={Colors.primary} />
                      )}
                      {isToday && (
                        <Text
                          style={{
                            fontFamily: Typography.family.sans,
                            fontSize: Typography.size.md,
                            fontWeight: Typography.weight.bold,
                            color: Colors.white,
                          }}
                        >
                          {day.slice(0, 2)}
                        </Text>
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </GlassCard>

        {/* Stats row */}
        <View style={{ flexDirection: "row", gap: 12 }}>
          <GlassCard style={{ flex: 1 }}>
            <View style={{ alignItems: "center", gap: 6 }}>
              <Flame size={20} color={Colors.primarySubtle} />
              <Text
                style={{
                  fontFamily: Typography.family.sans,
                  fontSize: 32,
                  fontWeight: Typography.weight.bold,
                  color: Colors.textPrimary,
                  fontVariant: ["tabular-nums"],
                }}
              >
                12
              </Text>
              <Text
                style={{
                  fontFamily: Typography.family.sans,
                  fontSize: Typography.size.md,
                  color: Colors.secondaryText,
                }}
              >
                Longest Streak
              </Text>
            </View>
          </GlassCard>
          <GlassCard style={{ flex: 1 }}>
            <View style={{ alignItems: "center", gap: 6 }}>
              <LayoutGrid size={20} color={Colors.primarySubtle} />
              <Text
                style={{
                  fontFamily: Typography.family.sans,
                  fontSize: 32,
                  fontWeight: Typography.weight.bold,
                  color: Colors.textPrimary,
                  fontVariant: ["tabular-nums"],
                }}
              >
                23
              </Text>
              <Text
                style={{
                  fontFamily: Typography.family.sans,
                  fontSize: Typography.size.md,
                  color: Colors.secondaryText,
                }}
              >
                Total Entries
              </Text>
            </View>
          </GlassCard>
        </View>

        {/* Insight */}
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
                fontSize: Typography.size.lg,
                fontWeight: Typography.weight.semibold,
                color: Colors.textPrimary,
              }}
            >
              Insight
            </Text>
          </View>
          <Text
            style={{
              fontFamily: Typography.family.sans,
              fontSize: Typography.size.base,
              color: Colors.textPrimary,
              lineHeight: 21,
            }}
          >
            You tend to feel most grounded mid-week. Your Wednesday entries are
            consistently calmer.
          </Text>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}
