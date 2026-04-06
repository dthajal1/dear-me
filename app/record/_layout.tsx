import { Stack } from "expo-router/stack";

export default function RecordLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#EFF2E6" },
      }}
    >
      <Stack.Screen name="camera" />
      <Stack.Screen name="recording" />
      <Stack.Screen
        name="add-notes"
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: "",
          headerBackButtonDisplayMode: "minimal",
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="review"
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: "",
          headerBackButtonDisplayMode: "minimal",
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen name="processing" />
      <Stack.Screen name="saved" />
    </Stack>
  );
}
