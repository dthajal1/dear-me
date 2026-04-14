import { ReactNode } from "react";
import { ScreenBackground } from "@/components/dear-me/screen-background";

export default function InsightsThreadLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="relative flex h-dvh flex-col">
      <ScreenBackground />
      <main className="relative min-h-0 flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
