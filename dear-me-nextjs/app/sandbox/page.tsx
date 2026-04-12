import { ScreenBackground } from "@/components/dear-me/screen-background";

export default function Sandbox() {
  return (
    <div className="relative flex min-h-dvh flex-col gap-6 p-6">
      <ScreenBackground />
      <h1 className="text-2xl font-semibold">Sandbox</h1>

      {/* ScreenBackground proof: translucent card shows gradient beneath */}
      <div className="rounded-2xl border border-[var(--color-glass-border)] bg-[var(--color-card)] p-5 shadow-[var(--shadow-glass)] backdrop-blur">
        <p className="text-sm font-medium">ScreenBackground preview</p>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          You should see a soft olive gradient behind this card, matching the Home frame in design.pen.
        </p>
      </div>

      {/* components get imported and rendered here during Phase B */}
    </div>
  );
}
