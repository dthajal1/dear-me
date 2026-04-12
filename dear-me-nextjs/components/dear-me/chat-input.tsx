"use client";

import { useState, type FormEvent } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  placeholder?: string;
  /** Optional submit handler. If omitted, the form does nothing on submit. */
  onSubmit?: (value: string) => void;
  className?: string;
}

/**
 * Footer input row used in chat/insights screens.
 * Design spec (nkX5B): input field 44px tall, cornerRadius 22px, backdrop-blur;
 * send button 44×44 rounded-full, primary olive fill, white arrow-up icon.
 */
export function ChatInput({
  placeholder = "Ask about your feelings...",
  onSubmit,
  className,
}: ChatInputProps) {
  const [value, setValue] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!value.trim()) return;
    onSubmit?.(value);
    setValue("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex items-center gap-2.5", className)}
    >
      {/* Input field — glass surface with blur, 44px tall, 22px radius */}
      <div
        className={cn(
          "flex flex-1 items-center",
          "h-11 rounded-[22px]",
          "border border-[color:#8A9A5B28]",
          "bg-white/63 backdrop-blur-[12px]",
          "px-4",
        )}
      >
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="
            min-w-0 flex-1 bg-transparent
            text-sm text-foreground
            placeholder:text-[color:#2C331E55]
            outline-none
          "
        />
      </div>

      {/* Send button — 44×44 rounded-full, primary olive, white icon */}
      <button
        type="submit"
        aria-label="Send"
        className="
          flex size-11 shrink-0 items-center justify-center rounded-full
          bg-[var(--color-primary)] text-white
          shadow-[var(--shadow-floating)]
          transition-opacity hover:opacity-90
          disabled:opacity-40
        "
        disabled={!value.trim()}
      >
        <ArrowUp className="size-[18px]" />
      </button>
    </form>
  );
}
