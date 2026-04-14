import { BackHeader } from "@/components/dear-me/back-header";
import { MemoCard } from "@/components/dear-me/memo-card";
import { ScreenBackground } from "@/components/dear-me/screen-background";

// Mock data sourced from design.pen frame 4SYRl "Streak Date Memos"
const MEMOS = [
  {
    id: "1",
    title: "Morning reflection",
    preview:
      '"Today felt calm... like things were finally under control."',
    duration: "0:42",
    timestamp: "9:15 AM",
    mood: "calm · grounded · hopeful",
  },
  {
    id: "2",
    title: "Afternoon walk",
    preview:
      '"Had a great lunch with Sarah. Felt so grateful for friendships that last."',
    duration: "1:15",
    timestamp: "1:30 PM",
    mood: "grateful · friendship · joy",
  },
  {
    id: "3",
    title: "Evening wind-down",
    preview:
      '"Long day. Maybe that\'s okay — not every day has to be perfect."',
    duration: "2:08",
    timestamp: "9:45 PM",
    mood: "reflective · growth",
  },
] as const;

export default async function StreakDayPage({
  params,
}: {
  params: Promise<{ day: string }>;
}) {
  // Must be awaited per Next.js 15+ async params convention, even if unused for display.
  await params;

  return (
    <div className="relative flex min-h-dvh flex-col">
      <ScreenBackground />
      <BackHeader title="Day" backHref="/progress" />

      <div className="relative flex flex-1 flex-col gap-5 px-5 pt-2 pb-6">
        {/* Date heading + memo count — from design frame 4SYRl > dateBlock */}
        <header className="flex flex-col gap-1">
          <h1
            className="font-bold leading-tight text-foreground"
            style={{ fontSize: 26 }}
          >
            Wednesday, March 26
          </h1>
          <p
            className="text-sm"
            style={{ color: "#5C6B3AAA" }}
          >
            {MEMOS.length} memos recorded
          </p>
        </header>

        {/* Memo list */}
        <div className="flex flex-col gap-4">
          {MEMOS.map((m, i) => (
            <MemoCard
              key={m.id}
              href={`/memo/${i + 1}`}
              title={m.title}
              preview={m.preview}
              duration={m.duration}
              timestamp={m.timestamp}
              mood={m.mood}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
