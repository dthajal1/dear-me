import { View, type ViewProps } from "react-native";

interface ScreenBackgroundProps {
  children: React.ReactNode;
  style?: ViewProps["style"];
}

export function ScreenBackground({ children, style }: ScreenBackgroundProps) {
  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: "#EFF2E6",
          experimental_backgroundImage: [
            // Radial glow — top-left (25%, 15%), oval 140%×100%, #D8E0C4 at 50% opacity
            `radial-gradient(ellipse 140% 100% at 25% 15%, rgba(216,224,196,0.5) 0%, transparent 100%)`,
            // Radial glow — bottom-right (80%, 75%), oval 100%×80%, #D0DCC0 at 40% opacity
            `radial-gradient(ellipse 100% 80% at 80% 75%, rgba(208,220,192,0.4) 0%, transparent 100%)`,
          ].join(", "),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
