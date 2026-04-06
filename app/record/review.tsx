import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Check, Plus, X, Clock } from "lucide-react-native";
import { ScreenBackground } from "@/components/ui/screen-background";
import { PrimaryButton } from "@/components/ui/primary-button";
import { GlassCard } from "@/components/ui/glass-card";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DETECTED_MOODS = ["overwhelmed", "anxious", "sad", "stressed"];

export default function ReviewScreen() {
  const router = useRouter();
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
        {/* Title */}
        <View style={{ gap: 6 }}>
          <Text
            style={{
              fontFamily: Typography.family.sans,
              fontSize: Typography.size["4xl"],
              fontWeight: Typography.weight.bold,
              color: Colors.textPrimary,
            }}
          >
            Review & Save
          </Text>
          <Text
            style={{
              fontFamily: Typography.family.sans,
              fontSize: Typography.size.base,
              color: Colors.secondaryText,
            }}
          >
            {"Here's what we captured"}
          </Text>
        </View>

        {/* Video preview */}
        <View
          style={{
            borderRadius: 14,
            overflow: "hidden",
            height: 180,
            backgroundColor: "#2a2a2a",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#ffffff44", fontSize: 14 }}>
            Video Preview
          </Text>
          <View
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              backgroundColor: "#FF000044",
              paddingVertical: 3,
              paddingHorizontal: 8,
              borderRadius: 6,
            }}
          >
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: Colors.recordRed,
              }}
            />
            <Text style={{ color: Colors.white, fontSize: 10, fontWeight: "600" }}>
              REC
            </Text>
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

        {/* AI summary */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 6,
          }}
        >
          <Text style={{ fontSize: 13 }}>{"🌿"}</Text>
          <Text
            style={{
              flex: 1,
              fontFamily: Typography.family.sans,
              fontSize: Typography.size.md,
              color: Colors.secondaryText,
              fontStyle: "italic",
              lineHeight: 18,
            }}
          >
            {"We heard you — here's what stood out."}
          </Text>
        </View>

        {/* Moods */}
        <View style={{ gap: 10 }}>
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
                fontSize: Typography.size.lg,
                fontWeight: Typography.weight.semibold,
                color: Colors.textPrimary,
              }}
            >
              Moods
            </Text>
            <Text
              style={{
                fontFamily: Typography.family.sans,
                fontSize: Typography.size.sm,
                color: Colors.textMuted,
              }}
            >
              tap x to remove
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            {DETECTED_MOODS.map((mood) => (
              <View
                key={mood}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 14,
                  backgroundColor: Colors.accentBgLight,
                  borderWidth: 1,
                  borderColor: Colors.accentBorderFaint,
                }}
              >
                <Text
                  style={{
                    fontFamily: Typography.family.sans,
                    fontSize: Typography.size.md,
                    color: Colors.secondaryText,
                  }}
                >
                  {mood}
                </Text>
                <X size={12} color={Colors.textMuted} />
              </View>
            ))}
            <Pressable
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: Colors.accentBorderFaint,
                borderStyle: "dashed",
              }}
            >
              <Plus size={12} color={Colors.textMuted} />
              <Text
                style={{
                  fontFamily: Typography.family.sans,
                  fontSize: Typography.size.md,
                  color: Colors.textMuted,
                }}
              >
                Add
              </Text>
            </Pressable>
          </View>
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
              {"\"Work has been really overwhelming lately. I feel like I can't keep up with everything...\""}
            </Text>
            <Pressable
              onPress={() => router.push("/transcript")}
            >
              <Text
                style={{
                  fontFamily: Typography.family.sans,
                  fontSize: Typography.size.base,
                  fontWeight: Typography.weight.semibold,
                  color: Colors.textPrimary,
                }}
              >
                View full transcript
              </Text>
            </Pressable>
          </View>
        </GlassCard>

        {/* Your note */}
        <GlassCard>
          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={{ fontSize: 14 }}>{"✏️"}</Text>
              <Text
                style={{
                  fontFamily: Typography.family.sans,
                  fontSize: Typography.size.lg,
                  fontWeight: Typography.weight.semibold,
                  color: Colors.textPrimary,
                }}
              >
                Your note
              </Text>
            </View>
            <Text
              style={{
                fontFamily: Typography.family.sans,
                fontSize: Typography.size.base,
                color: Colors.textPrimary,
                lineHeight: 22,
              }}
            >
              Work has been a lot lately. Need to remember this feeling so I can
              appreciate when things get better.
            </Text>
            <Pressable>
              <Text
                style={{
                  fontFamily: Typography.family.sans,
                  fontSize: Typography.size.base,
                  fontWeight: Typography.weight.medium,
                  color: Colors.secondaryText,
                }}
              >
                Edit note
              </Text>
            </Pressable>
          </View>
        </GlassCard>

        {/* Save button */}
        <PrimaryButton
          label="Save Memo"
          icon={Check}
          onPress={() => router.push("/record/processing")}
        />

        {/* Start over */}
        <Pressable
          onPress={() => router.navigate("/record/camera")}
          style={{ alignItems: "center", paddingVertical: 8 }}
        >
          <Text
            style={{
              fontFamily: Typography.family.sans,
              fontSize: Typography.size.base,
              color: Colors.textMuted,
            }}
          >
            Start over
          </Text>
        </Pressable>

        {/* Privacy */}
        <Text
          style={{
            fontFamily: Typography.family.sans,
            fontSize: Typography.size.sm,
            color: Colors.secondaryFaint,
            textAlign: "center",
          }}
        >
          {"🔒"} Only you can see your memos — stored
        </Text>
      </ScrollView>
    </ScreenBackground>
  );
}
