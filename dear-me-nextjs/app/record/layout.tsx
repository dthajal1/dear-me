import { ReactNode } from "react";
import { ScreenBackground } from "@/components/dear-me/screen-background";

export default function RecordLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <ScreenBackground />
      <div className="relative flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
