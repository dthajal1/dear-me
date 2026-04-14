import { TrendingUp } from "lucide-react";

export default function ProgressPage() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-10 pb-4">
      <div className="flex size-20 items-center justify-center rounded-full bg-[color:var(--color-muted)] shadow-[inset_0_0_0_1px_var(--color-glass-border)]">
        <TrendingUp className="size-8 text-[color:var(--color-accent)]" aria-hidden />
      </div>

      <div className="mt-6 flex flex-col items-center gap-3 text-center">
        <h1 className="text-[28px] font-semibold leading-tight text-foreground">
          Coming Soon
        </h1>
        <p className="text-[15px] leading-relaxed text-[color:var(--color-muted-foreground)]">
          Streak progress tracking is on the way. Stay tuned!
        </p>
      </div>
    </div>
  );
}
