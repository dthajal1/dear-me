import { Stack } from "expo-router/stack";

export default function MemoLayout() {
  return (
    <Stack
      screenOptions={{
        headerTransparent: true,
        headerShadowVisible: false,
        headerLargeTitleShadowVisible: false,
        headerLargeStyle: { backgroundColor: "transparent" },
        headerBlurEffect: "none",
        headerBackButtonDisplayMode: "minimal",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Memo",
          headerLargeTitle: true,
          headerSearchBarOptions: {
            placeholder: "Search memos...",
          },
        }}
      />
    </Stack>
  );
}
