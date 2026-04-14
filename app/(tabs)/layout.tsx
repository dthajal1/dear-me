import { ReactNode } from "react";
import { TabBar } from "@/components/dear-me/tab-bar";
import { ScreenBackground } from "@/components/dear-me/screen-background";

export default function TabsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex h-dvh flex-col">
      <ScreenBackground />
      <main className="relative min-h-0 flex-1 overflow-y-auto">{children}</main>
      <nav aria-label="Primary" className="relative px-4 pb-4">
        <TabBar />
      </nav>
    </div>
  );
}
