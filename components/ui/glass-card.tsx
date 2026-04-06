import { View, type ViewProps } from "react-native";
import { BlurView } from "expo-blur";
import { Colors } from "@/constants/colors";

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewProps["style"];
  intensity?: number;
  padding?: number;
  borderRadius?: number;
  withShadow?: boolean;
}

export function GlassCard({
  children,
  style,
  intensity = 16,
  padding = 20,
  borderRadius = 16,
  withShadow = true,
}: GlassCardProps) {
  return (
    <View
      style={[
        {
          borderRadius,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: Colors.accentBorder,
          ...(withShadow && {
            boxShadow: `0px 4px 10px ${Colors.shadowCard}, 0px 1px 2px ${Colors.shadowCardSubtle}`,
          }),
        },
        style,
      ]}
    >
      <BlurView intensity={intensity} tint="light" style={{ padding }}>
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: Colors.glassWhite,
          }}
        />
        {children}
      </BlurView>
    </View>
  );
}
