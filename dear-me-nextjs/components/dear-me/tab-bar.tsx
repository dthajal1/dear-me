"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Bookmark, MessageCircle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface TabDef {
  href: string;
  label: string;
  Icon: typeof House;
}

const TABS: readonly TabDef[] = [
  { href: "/home", label: "Home", Icon: House },
  { href: "/memo", label: "Memo", Icon: Bookmark },
  { href: "/insights", label: "Insights", Icon: MessageCircle },
  { href: "/progress", label: "Progress", Icon: TrendingUp },
] as const;

/**
 * Bottom tab bar — glass pill with four tabs and an animated indicator
 * that slides to the active tab. Uses usePathname() to determine active
 * state so it updates on navigation without prop-drilling.
 *
 * Design tokens:
 *   Outer pill: cornerRadius 32, padding 3, fill #FFFFFF99, blur 24px, border #8A9A5B18 0.5px
 *   Inner tab: cornerRadius 28, vertical layout, gap 5
 *   Active indicator: filled pill (cornerRadius 28) with --color-primary
 *   Outer container padding: 10px top, 20px sides, 20px bottom
 */
export function TabBar() {
  const pathname = usePathname();

  const activeIndex = TABS.findIndex(
    (tab) => pathname === tab.href || pathname.startsWith(`${tab.href}/`),
  );

  return (
    <nav
      aria-label="Primary"
      className="mx-auto w-full max-w-[393px] px-5 pt-2.5 pb-5"
    >
      {/* Outer glass pill */}
      <div
        className="relative flex items-center rounded-[32px] p-[3px] backdrop-blur-[24px]"
        style={{
          background: "rgba(255,255,255,0.6)",
          boxShadow: "0 -1px 12px rgba(0,0,0,0.063)",
          border: "0.5px solid rgba(138,154,91,0.094)",
        }}
      >
        {/* Animated active indicator */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-[3px] bottom-[3px] rounded-[28px] bg-[var(--color-primary)] transition-transform duration-300 ease-out"
          style={{
            width: `calc(100% / ${TABS.length})`,
            left: "3px",
            right: "3px",
            transform:
              activeIndex >= 0
                ? `translateX(calc(${activeIndex} * 100%))`
                : "translateX(0)",
            opacity: activeIndex >= 0 ? 1 : 0,
          }}
        />

        {/* Tabs */}
        {TABS.map((tab, i) => {
          const isActive = i === activeIndex;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative z-10 flex flex-1 flex-col items-center justify-center gap-[5px] py-2",
                "text-[11px] tracking-[0.3px] transition-colors duration-200",
                isActive
                  ? "font-semibold text-[color:var(--color-primary-foreground)]"
                  : "font-normal text-[color:var(--color-tab-label-inactive)]",
              )}
            >
              <tab.Icon
                className={cn(
                  "size-5",
                  isActive
                    ? "text-[color:var(--color-primary-foreground)]"
                    : "text-[color:var(--color-tab-icon-inactive)]",
                )}
                strokeWidth={isActive ? 2.25 : 1.75}
              />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
