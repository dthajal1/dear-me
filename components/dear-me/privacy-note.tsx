import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface PrivacyNoteProps {
  /** Optional override text. Defaults to the copy from design.pen. */
  text?: string;
  className?: string;
}

export function PrivacyNote({ text, className }: PrivacyNoteProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5",
        "text-[length:var(--text-caption)] text-[color:var(--color-privacy-note-fg)]",
        className,
      )}
    >
      <Lock className="size-3 shrink-0" aria-hidden />
      <span>{text ?? "Your memos are private & on-device"}</span>
    </div>
  );
}
