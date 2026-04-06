import "@/src/global.css";
import { Stack } from "expo-router/stack";
import { StatusBar } from "expo-status-bar";

const transparentHeader = {
  headerShown: true,
  headerTransparent: true,
  headerTitle: "",
  headerBackButtonDisplayMode: "minimal" as const,
  headerShadowVisible: false,
};

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#EFF2E6" },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="record"
          options={{
            animation: "slide_from_bottom",
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="memo/[id]"
          options={{
            animation: "slide_from_right",
            ...transparentHeader,
          }}
        />
        <Stack.Screen
          name="memo-trigger"
          options={{ animation: "fade" }}
        />
        <Stack.Screen
          name="memo-playback"
          options={{
            animation: "slide_from_right",
            ...transparentHeader,
          }}
        />
        <Stack.Screen
          name="transcript"
          options={{
            presentation: "formSheet",
            sheetGrabberVisible: true,
            sheetAllowedDetents: [0.75, 1.0],
          }}
        />
        <Stack.Screen
          name="streak-day"
          options={{
            animation: "slide_from_right",
            ...transparentHeader,
          }}
        />
      </Stack>
    </>
  );
}
