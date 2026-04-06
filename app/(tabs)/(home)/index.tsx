import { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Video } from "lucide-react-native";
import { ScreenBackground } from "@/components/ui/screen-background";
import { GlassCard } from "@/components/ui/glass-card";
import { MoodChip } from "@/components/ui/mood-chip";
import { PrivacyNote } from "@/components/ui/privacy-note";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { MOOD_OPTIONS, DAILY_PROMPTS, MOCK_MEMOS } from "@/constants/mock-data";

export default function HomeScreen() {
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const hasMemos = MOCK_MEMOS.length > 0;
  const promptIndex = new Date().getDate() % DAILY_PROMPTS.length;

  return (
    <ScreenBackground>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 12,
          paddingHorizontal: 20,
          gap: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Subtitle under native large title */}
        <Text
          style={{
            fontFamily: Typography.family.sans,
            fontSize: Typography.size.base,
            color: Colors.secondaryText,
            marginTop: -8,
          }}
        >
          {hasMemos
            ? "How are you feeling today?"
            : "Record video memos to your future self"}
        </Text>

        {/* Quick mood check-in - only when has memos */}
        {hasMemos && (
          <View style={{ gap: 10 }}>
            <Text
              style={{
                fontFamily: Typography.family.sans,
                fontSize: Typography.size.md,
                fontWeight: Typography.weight.semibold,
                color: Colors.textSecondary,
              }}
            >
              Quick check-in
            </Text>
            <View style={{ flexDirection: "row", gap: 6 }}>
              {MOOD_OPTIONS.map((mood) => (
                <MoodChip
                  key={mood.label}
                  emoji={mood.emoji}
                  label={mood.label}
                  selected={selectedMood === mood.label}
                  onPress={() => setSelectedMood(mood.label)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Center content area */}
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
          }}
        >
          {/* Record card */}
          <Pressable
            onPress={() => router.push("/record/camera")}
            style={{ width: "100%" }}
          >
            <GlassCard>
              <View style={{ alignItems: "center", gap: 10 }}>
                <Video size={32} color={Colors.primary} />
                <Text
                  style={{
                    fontFamily: Typography.family.sans,
                    fontSize: Typography.size.xl,
                    fontWeight: Typography.weight.semibold,
                    color: Colors.textPrimary,
                  }}
                >
                  Record a Memo
                </Text>
                <Text
                  style={{
                    fontFamily: Typography.family.sans,
                    fontSize: Typography.size.md,
                    color: Colors.secondaryText,
                  }}
                >
                  A message to your future self
                </Text>
              </View>
            </GlassCard>
          </Pressable>

          {/* Daily prompt */}
          <View style={{ alignItems: "center", gap: 4 }}>
            <Text
              style={{
                fontFamily: Typography.family.sans,
                fontSize: Typography.size.sm,
                fontWeight: Typography.weight.semibold,
                color: Colors.secondaryLight,
              }}
            >
              Not sure what to say?
            </Text>
            <Text
              style={{
                fontFamily: Typography.family.sans,
                fontSize: Typography.size.base,
                fontStyle: "italic",
                color: Colors.secondaryMuted,
              }}
            >
              {DAILY_PROMPTS[promptIndex]}
            </Text>
          </View>

          {/* Privacy note */}
          <PrivacyNote />
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}
