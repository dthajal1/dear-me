import { useState } from "react";
import { View, Text, ScrollView, TextInput, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ArrowRight, Clock, Type } from "lucide-react-native";
import { ScreenBackground } from "@/components/ui/screen-background";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AddNotesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [note, setNote] = useState("");
  const [title, setTitle] = useState("");

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
            Add Notes
          </Text>
          <Text
            style={{
              fontFamily: Typography.family.sans,
              fontSize: Typography.size.base,
              color: Colors.secondaryText,
            }}
          >
            {"Anything you'd tell your future self?"}
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
          {/* REC badge */}
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
            <Text
              style={{
                color: Colors.white,
                fontSize: 10,
                fontWeight: "600",
              }}
            >
              REC
            </Text>
          </View>
          {/* Duration */}
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
            <Text
              style={{
                fontSize: 11,
                color: Colors.white,
                fontVariant: ["tabular-nums"],
              }}
            >
              0:42
            </Text>
          </View>
        </View>

        {/* Transcribing indicator */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Text style={{ fontSize: 14 }}>{"✨"}</Text>
          <Text
            style={{
              fontFamily: Typography.family.sans,
              fontSize: Typography.size.base,
              color: Colors.secondaryText,
              fontStyle: "italic",
            }}
          >
            Listening to your thoughts...
          </Text>
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: Colors.primary,
            }}
          />
        </View>

        {/* Note input */}
        <View
          style={{
            backgroundColor: Colors.glassWhite,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: Colors.accentBorder,
            padding: 16,
            gap: 8,
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
            A note for future you
          </Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Anything you want to remember? (optional)"
            placeholderTextColor={Colors.textFaint}
            multiline
            style={{
              fontFamily: Typography.family.sans,
              fontSize: Typography.size.base,
              color: Colors.textPrimary,
              minHeight: 80,
              textAlignVertical: "top",
            }}
          />
        </View>

        {/* Title input */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            backgroundColor: Colors.glassWhite,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: Colors.accentBorder,
            paddingVertical: 14,
            paddingHorizontal: 16,
          }}
        >
          <Type size={14} color={Colors.textMuted} />
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Add a title (optional)"
            placeholderTextColor={Colors.textFaint}
            style={{
              flex: 1,
              fontFamily: Typography.family.sans,
              fontSize: Typography.size.base,
              color: Colors.textPrimary,
            }}
          />
        </View>

        {/* Continue button */}
        <PrimaryButton
          label="Continue"
          icon={ArrowRight}
          onPress={() => router.push("/record/review")}
        />

        {/* Maybe later */}
        <Pressable
          onPress={() => router.back()}
          style={{ alignItems: "center", paddingVertical: 8 }}
        >
          <Text
            style={{
              fontFamily: Typography.family.sans,
              fontSize: Typography.size.base,
              color: Colors.textMuted,
            }}
          >
            Maybe later
          </Text>
        </Pressable>
      </ScrollView>
    </ScreenBackground>
  );
}
