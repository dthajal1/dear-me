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
        "flex flex-1 flex-col gap-2 rounded-[var(--radius-md)] p-3.5 text-left",
        "border border-[color:var(--color-glass-border)] bg-[color:var(--color-glass-surface)] backdrop-blur-[12px]",
        "transition-opacity active:opacity-70",
        className,
      )}
    >
      {icon}
      <span className="text-[length:var(--text-small)] font-medium leading-snug text-foreground">
        {text}
      </span>
    </button>
  );
}
