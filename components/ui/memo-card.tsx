import { View, Text, Pressable } from "react-native";
import { Image } from "@/src/tw/image";
import { Play, Clock } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import type { Memo } from "@/constants/mock-data";

interface MemoCardProps {
  memo: Memo;
  onPress?: () => void;
}

export function MemoCard({ memo, onPress }: MemoCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        padding: 12,
        gap: 12,
        borderRadius: 16,
        backgroundColor: Colors.glassWhite,
        borderWidth: 1,
        borderColor: Colors.accentBorder,
        borderCurve: "continuous",
        boxShadow: `0px 2px 8px ${Colors.shadowLight}`,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      {/* Thumbnail */}
      <View
        style={{
          width: 90,
          height: 110,
          borderRadius: 12,
          overflow: "hidden",
          backgroundColor: Colors.accentBgLight,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {memo.thumbnailUrl ? (
          <Image
            source={memo.thumbnailUrl}
            style={{ width: 90, height: 110 }}
            contentFit="cover"
          />
        ) : null}
        {/* Play overlay */}
        <View
          style={{
            position: "absolute",
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: "#FFFFFF99",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Play size={14} color={Colors.primary} fill={Colors.primary} />
        </View>
      </View>

      {/* Right content */}
      <View style={{ flex: 1, gap: 8 }}>
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
              fontSize: Typography.size.base,
              fontWeight: Typography.weight.semibold,
              color: Colors.textPrimary,
            }}
          >
            {memo.time}
          </Text>
          <View
            style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
          >
            <Clock size={12} color={Colors.textMuted} />
            <Text
              style={{
                fontFamily: Typography.family.sans,
                fontSize: Typography.size.sm,
                color: Colors.textMuted,
              }}
            >
              {memo.duration}
            </Text>
          </View>
        </View>

        {/* Transcript preview */}
        <Text
          numberOfLines={2}
          style={{
            fontFamily: Typography.family.sans,
            fontSize: Typography.size.md,
            fontWeight: Typography.weight.normal,
            color: Colors.textPrimary,
            lineHeight: 18,
          }}
        >
          {memo.transcript}
        </Text>

        {/* Mood tags */}
        <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
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
    </Pressable>
  );
}
