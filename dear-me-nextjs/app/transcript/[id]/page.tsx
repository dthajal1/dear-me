import { FileText } from "lucide-react";
import { BackHeader } from "@/components/dear-me/back-header";
import { ScreenBackground } from "@/components/dear-me/screen-background";

export default async function TranscriptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="relative flex min-h-dvh flex-col">
      <ScreenBackground />
      <BackHeader title="Transcript" backHref={`/memo/${id}`} />

      <div className="relative flex flex-1 flex-col gap-5 px-5 pt-2 pb-6">
        {/* Recording meta */}
        <div className="flex items-center gap-[6px]">
          <FileText className="size-[14px] text-[#5C6B3AAA]" />
          <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--color-muted-foreground)]">
            0:42 recording
          </p>
        </div>

        {/* Transcript body */}
        <article className="flex flex-col gap-4 text-[15px] leading-[1.7] text-[#4D5A35FF]">
          <p>
            &ldquo;Work has been really overwhelming lately. I feel like I
            can&rsquo;t keep up with everything. The deadlines keep piling up
            and I just&hellip; I need a break. I know I&rsquo;ll look back at
            this and hopefully things will be better by then.
          </p>
          <p>
            I&rsquo;ve been trying to stay positive but it&rsquo;s hard when
            every day feels the same. Maybe I should take a day off this week.
            Just one day to reset.
          </p>
          <p>
            Dear me, if you&rsquo;re watching this — I hope you found that
            balance. I hope work isn&rsquo;t consuming you anymore. Take care
            of yourself.&rdquo;
          </p>
        </article>
      </div>
    </div>
  );
}
