import { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { Bookmark, House } from "lucide-react-native";
import { ScreenBackground } from "@/components/ui/screen-background";
import { FilterPill } from "@/components/ui/filter-pill";
import { MemoCard } from "@/components/ui/memo-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Colors } from "@/constants/colors";
import {
  MOCK_MEMOS,
  TIME_FILTERS,
  EMOTION_FILTERS,
} from "@/constants/mock-data";

export default function MemoScreen() {
  const router = useRouter();
  const [activeTimeIndex, setActiveTimeIndex] = useState(0);
  const [activeEmotionFilter, setActiveEmotionFilter] = useState("All");
  const hasMemos = MOCK_MEMOS.length > 0;

  if (!hasMemos) {
    return (
      <ScreenBackground>
        <EmptyState
          icon={Bookmark}
          title="No memos yet"
          subtitle={
            "Record a video memo from Home \u2014\nyour future self will find it here"
          }
          actionLabel="Go to Home"
          actionIcon={House}
          onAction={() => router.navigate("/")}
        />
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingBottom: 12,
          paddingHorizontal: 20,
          gap: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Subtitle */}
        <Text
          style={{
            fontSize: 14,
            color: Colors.secondaryText,
            marginTop: -4,
          }}
        >
          Messages from your past self
        </Text>

        {/* Time filters — native segmented control */}
        <SegmentedControl
          values={TIME_FILTERS}
          selectedIndex={activeTimeIndex}
          onChange={(event) =>
            setActiveTimeIndex(event.nativeEvent.selectedSegmentIndex)
          }
          appearance="light"
        />

        {/* Emotion filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {EMOTION_FILTERS.map((filter) => (
            <FilterPill
              key={filter}
              label={filter}
              active={activeEmotionFilter === filter}
              onPress={() => setActiveEmotionFilter(filter)}
            />
          ))}
        </ScrollView>

        {/* Memo list */}
        <View style={{ gap: 16 }}>
          {MOCK_MEMOS.map((memo) => (
            <MemoCard
              key={memo.id}
              memo={memo}
              onPress={() => router.push(`/memo/${memo.id}`)}
            />
          ))}
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}
