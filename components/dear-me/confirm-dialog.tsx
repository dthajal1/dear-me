"use client";

import { useEffect, useState } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
}: ConfirmDialogProps) {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setContainer(document.getElementById("mobile-frame-root"));
  }, []);

  async function handleConfirm() {
    await onConfirm();
    onOpenChange(false);
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal container={container}>
        <DialogPrimitive.Backdrop
          className={cn(
            "absolute inset-0 z-50 bg-black/25 transition-opacity duration-150",
            "supports-backdrop-filter:backdrop-blur-[2px]",
            "data-starting-style:opacity-0 data-ending-style:opacity-0",
          )}
        />
        <DialogPrimitive.Popup
          className={cn(
            "absolute top-1/2 left-1/2 z-50 w-[calc(100%-2.5rem)] max-w-[320px]",
            "-translate-x-1/2 -translate-y-1/2",
            "rounded-2xl border border-[color:var(--color-glass-border)]",
            "bg-[color:var(--color-glass-surface)] backdrop-blur-[16px]",
            "shadow-[var(--shadow-elevated)]",
            "p-5 outline-none",
            "transition-[opacity,transform] duration-150 ease-out",
            "data-starting-style:opacity-0 data-starting-style:scale-95",
            "data-ending-style:opacity-0 data-ending-style:scale-95",
          )}
        >
          <div className="flex flex-col gap-2 text-center">
            <DialogPrimitive.Title className="text-[length:var(--text-subtitle)] font-semibold text-foreground">
              {title}
            </DialogPrimitive.Title>
            {description ? (
              <DialogPrimitive.Description className="text-sm leading-relaxed text-[color:var(--color-muted-foreground)]">
                {description}
              </DialogPrimitive.Description>
            ) : null}
          </div>

          <div className="mt-5 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleConfirm}
              className={cn(
                "rounded-full px-5 py-3 text-sm font-semibold",
                "transition-opacity active:opacity-70",
                destructive
                  ? "bg-[#B45544] text-white"
                  : "bg-[var(--color-primary)] text-[color:var(--color-primary-foreground)]",
              )}
            >
              {confirmLabel}
            </button>
            <DialogPrimitive.Close
              className={cn(
                "rounded-full px-5 py-3 text-sm font-medium",
                "text-[color:var(--color-muted-foreground)]",
                "transition-opacity active:opacity-70",
              )}
            >
              {cancelLabel}
            </DialogPrimitive.Close>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
