import { useEffect } from "react";
import { View, Text, Pressable, useWindowDimensions } from "react-native";
import { BlurView } from "expo-blur";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import {
  House,
  Bookmark,
  MessageCircle,
  TrendingUp,
} from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import type { LucideIcon } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface TabItem {
  key: string;
  label: string;
  icon: LucideIcon;
}

const TABS: TabItem[] = [
  { key: "(home)", label: "Home", icon: House },
  { key: "(memo)", label: "Memo", icon: Bookmark },
  { key: "(insights)", label: "Insights", icon: MessageCircle },
  { key: "(progress)", label: "Progress", icon: TrendingUp },
];

const SPRING_CONFIG = { damping: 28, stiffness: 450, mass: 0.8 };
const BAR_H = 66;
const BAR_MX = 21;
const BAR_PADDING = 5;

interface CustomTabBarProps {
  activeTab: string;
  onTabPress: (key: string) => void;
}

export function CustomTabBar({ activeTab, onTabPress }: CustomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();

  const barInnerWidth = screenWidth - BAR_MX * 2 - BAR_PADDING * 2;
  const tabWidth = barInnerWidth / TABS.length;

  const activeIndex = TABS.findIndex((t) => t.key === activeTab);
  const translateX = useSharedValue(activeIndex * tabWidth);

  useEffect(() => {
    translateX.value = withSpring(activeIndex * tabWidth, SPRING_CONFIG);
  }, [activeIndex, tabWidth, translateX]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View
      style={{
        height: BAR_H,
        padding: BAR_PADDING,
        marginHorizontal: BAR_MX,
        marginBottom: Math.max(insets.bottom, 8),
        borderRadius: 36,
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.accentBorder,
        boxShadow: `0px -2px 8px ${Colors.shadowLight}`,
      }}
    >
      {/* Animated glass pill */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: BAR_PADDING,
            left: BAR_PADDING,
            width: tabWidth,
            height: BAR_H - BAR_PADDING * 2,
            borderRadius: 26,
            overflow: "hidden",
          },
          pillStyle,
        ]}
      >
        <BlurView
          intensity={40}
          tint="systemChromeMaterial"
          style={{
            flex: 1,
            borderRadius: 26,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "#8A9A5B0A",
              borderRadius: 26,
              borderWidth: 0.5,
              borderColor: "#8A9A5B15",
            }}
          />
        </BlurView>
      </Animated.View>

      {/* Tab buttons */}
      <View style={{ flex: 1, flexDirection: "row" }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;

          return (
            <Pressable
              key={tab.key}
              onPress={() => onTabPress(tab.key)}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
              }}
            >
              <Icon
                size={18}
                color={isActive ? Colors.textPrimary : Colors.textMuted}
              />
              <Text
                style={{
                  fontFamily: Typography.family.sans,
                  fontSize: Typography.size.xs,
                  fontWeight: isActive
                    ? Typography.weight.semibold
                    : Typography.weight.medium,
                  letterSpacing: 0.3,
                  color: isActive ? Colors.textPrimary : Colors.secondaryText,
                }}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
