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
        id="mobile-frame-root"
        className="
          relative mx-auto flex min-h-dvh w-full flex-col
          bg-background text-foreground
          md:min-h-[min(900px,calc(100dvh-3rem))]
          md:max-w-[var(--width-mobile-frame)]
          md:overflow-hidden md:rounded-[var(--radius-mobile-frame)]
          md:shadow-[var(--shadow-mobile-frame)]
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
