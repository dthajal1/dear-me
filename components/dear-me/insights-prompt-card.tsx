"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface InsightsPromptCardProps {
  icon: ReactNode;
  text: string;
  onClick: () => void;
  className?: string;
}

export function InsightsPromptCard({
  icon,
  text,
  onClick,
  className,
}: InsightsPromptCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 flex-col gap-2 rounded-[14px] p-3.5 text-left",
        "border border-[#8A9A5B28] bg-white/63 backdrop-blur-[12px]",
        "transition-opacity active:opacity-70",
        className,
      )}
    >
      {icon}
      <span className="text-[13px] font-medium leading-[1.4] text-[#2C331EDD]">
        {text}
      </span>
    </button>
  );
}
