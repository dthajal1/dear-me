import { ReactNode } from "react";

interface MobileFrameProps {
  children: ReactNode;
}

/**
 * Full-bleed on real mobile, centered ~430px column on desktop.
 * No fake phone chrome — just a clean centered container with
 * safe-area insets respected.
 */
export function MobileFrame({ children }: MobileFrameProps) {
  return (
    <div className="min-h-dvh w-full md:flex md:items-center md:justify-center md:py-6">
      <div
        className="
          relative mx-auto flex min-h-dvh w-full flex-col
          bg-background text-foreground
          md:min-h-[min(900px,calc(100dvh-3rem))]
          md:max-w-[430px]
          md:overflow-hidden md:rounded-[32px]
          md:shadow-[0_40px_120px_-30px_rgba(0,0,0,0.25)]
        "
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
