import { ReactNode } from "react";
import { TabBar } from "@/components/dear-me/tab-bar";
import { ScreenBackground } from "@/components/dear-me/screen-background";

export default function TabsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <ScreenBackground />
      <main className="relative flex-1 overflow-y-auto pb-24">{children}</main>
      <nav aria-label="Primary" className="absolute inset-x-0 bottom-0 px-4 pb-4">
        <TabBar />
      </nav>
    </div>
  );
}
