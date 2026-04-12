import { ScreenBackground } from "@/components/dear-me/screen-background";
import { BackPill } from "@/components/dear-me/back-pill";
import { BackHeader } from "@/components/dear-me/back-header";

export default function Sandbox() {
  return (
    <div className="relative flex min-h-dvh flex-col gap-6 p-6">
      <ScreenBackground />
      <h1 className="text-2xl font-semibold">Sandbox</h1>

      {/* ScreenBackground proof: translucent card shows gradient beneath */}
      <div className="rounded-2xl border border-[var(--color-glass-border)] bg-[var(--color-card)] p-5 shadow-[var(--shadow-glass)] backdrop-blur">
        <p className="text-sm font-medium">ScreenBackground preview</p>
        <p className="mt-1 text-sm text-[color:var(--color-muted-foreground)]">
          You should see a soft olive gradient behind this card, matching the Home frame in design.pen.
        </p>
      </div>

      {/* ── BackPill + BackHeader previews ── */}
      <div className="flex flex-col gap-6">

        {/* BackPill — icon only */}
        <div className="flex flex-col gap-2">
          <p className="text-xs text-[color:var(--color-muted-foreground)]">BackPill — icon only</p>
          <BackPill />
        </div>

        {/* BackPill — label + link */}
        <div className="flex flex-col gap-2">
          <p className="text-xs text-[color:var(--color-muted-foreground)]">BackPill — label + link</p>
          <BackPill label="Back" href="/home" />
        </div>

        {/* BackHeader — no right slot */}
        <div className="flex flex-col gap-2">
          <p className="text-xs text-[color:var(--color-muted-foreground)]">BackHeader — centered title, no right slot</p>
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-glass-border)] bg-[var(--color-card)] shadow-[var(--shadow-glass)] backdrop-blur overflow-hidden">
            <BackHeader title="Preview" backHref="/home" />
          </div>
        </div>

        {/* BackHeader — with right slot */}
        <div className="flex flex-col gap-2">
          <p className="text-xs text-[color:var(--color-muted-foreground)]">BackHeader — centered title + right slot</p>
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-glass-border)] bg-[var(--color-card)] shadow-[var(--shadow-glass)] backdrop-blur overflow-hidden">
            <BackHeader
              title="Preview"
              rightSlot={
                <button className="text-sm font-medium text-foreground">Share</button>
              }
            />
          </div>
        </div>

      </div>
    </div>
  );
}
