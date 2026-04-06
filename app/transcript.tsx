import { Text, ScrollView } from "react-native";
import { Stack } from "expo-router/stack";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";

export default function TranscriptScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Transcript",
          presentation: "formSheet",
          sheetGrabberVisible: true,
          sheetAllowedDetents: [0.75, 1.0],
        }}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          padding: 20,
          gap: 16,
        }}
      >
        {/* Duration */}
        <Text
          style={{
            fontFamily: Typography.family.sans,
            fontSize: Typography.size.md,
            color: Colors.textMuted,
          }}
        >
          0:42 recording
        </Text>

        {/* Transcript content */}
        <Text
          selectable
          style={{
            fontFamily: Typography.family.sans,
            fontSize: Typography.size.base,
            color: Colors.textPrimary,
            lineHeight: 24,
          }}
        >
          {`"Work has been really overwhelming lately. I feel like I can't keep up with everything. The deadlines keep piling up and I just... I need a break. I know I'll look back at this and hopefully things will be better by then.\n\nI've been trying to stay positive but it's hard when every day feels the same. Maybe I should take a day off this week. Just one day to reset.\n\nDear me, if you're watching this — I hope you found that balance. I hope work isn't consuming you anymore. Take care of yourself."`}
        </Text>
      </ScrollView>
    </>
  );
}
