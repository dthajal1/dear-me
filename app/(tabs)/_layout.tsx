import { Tabs } from "expo-router";
import { CustomTabBar } from "@/components/tab-bar";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

function TabBar({ state, navigation }: BottomTabBarProps) {
  const routes = state.routes;
  const activeRoute = routes[state.index].name;

  return (
    <CustomTabBar
      activeTab={activeRoute}
      onTabPress={(key) => {
        const event = navigation.emit({
          type: "tabPress",
          target: routes.find((r) => r.name === key)?.key,
          canPreventDefault: true,
        });
        if (!event.defaultPrevented) {
          navigation.navigate(key);
        }
      }}
    />
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
        },
      }}
    >
      <Tabs.Screen name="(home)" />
      <Tabs.Screen name="(memo)" />
      <Tabs.Screen name="(insights)" />
      <Tabs.Screen name="(progress)" />
    </Tabs>
  );
}
