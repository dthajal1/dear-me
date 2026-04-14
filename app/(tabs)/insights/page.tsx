import { MessageCircleHeart, CloudSun, Sun, TrendingUp, Heart } from "lucide-react";
import { ChatInput } from "@/components/dear-me/chat-input";
import { cn } from "@/lib/utils";

// Toggle to preview the empty state in dev.
const HAS_DATA = true;

interface Message {
  role: "user" | "assistant";
  text: string;
}

/** Mood bar row inside the AI summary card */
interface MoodRow {
  label: string;
  pct: number;
  fill: string;
}

const MOOD_ROWS: MoodRow[] = [
  { label: "Peaceful", pct: 38, fill: "#5C6B3ABB" },
  { label: "Grateful", pct: 27, fill: "#6B7A48CC" },
  { label: "Stressed", pct: 20, fill: "#8A9A5B30" },
  { label: "Reflective", pct: 10, fill: "#8A9A5B55" },
  { label: "Anxious", pct: 5, fill: "#C4956044" },
];

const THREAD: Message[] = [
  {
    role: "user",
    text: "How have I been feeling this past week?",
  },
  {
    role: "assistant",
    text: "You've been trending calmer this week. There was some tension mid-week around deadlines, but overall — you're in a good place.",
  },
];

/** Prompt suggestion cards shown in empty state */
const PROMPT_CARDS = [
  { icon: <CloudSun className="size-5 text-[#5C6B3ABB]" />, text: "How have I been feeling lately?" },
  { icon: <Sun className="size-5 text-[#5C6B3ABB]" />, text: "When do I feel most at peace?" },
  { icon: <TrendingUp className="size-5 text-[#5C6B3ABB]" />, text: "Am I handling stress better?" },
  { icon: <Heart className="size-5 text-[#5C6B3ABB]" />, text: "What makes me happiest?" },
];

function EmptyInsights() {
  return (
    <div className="flex min-h-full flex-col">
      <div className="flex flex-1 flex-col gap-6 px-5 pt-6 pb-4">
        {/* Header */}
        <header className="flex flex-col gap-1">
          <h1 className="text-[28px] font-bold text-[#2C331EDD]">Insights</h1>
          <p className="text-sm text-[#6B7A48FF]">Ask about your emotional journey</p>
        </header>

        {/* Centered illustration + prompts grid */}
        <div className="flex flex-1 flex-col items-center justify-center gap-6">
          {/* Icon + copy block */}
          <div className="flex flex-col items-center gap-5">
            <div className="flex size-[104px] items-center justify-center rounded-full bg-[#8A9A5B15]">
              <MessageCircleHeart className="size-11 text-[#5C6B3A55]" />
            </div>
            <div className="flex w-[280px] flex-col items-center gap-2 text-center">
              <p className="text-[19px] font-semibold text-[#2C331EDD]">
                What&apos;s on your mind?
              </p>
              <p className="text-sm leading-relaxed text-[#6B7A48FF]">
                I&apos;ll look through your entries and reflections to help you see patterns and find perspective.
              </p>
            </div>
          </div>

          {/* Prompt suggestion cards — 2×2 grid */}
          <div className="flex w-full flex-col gap-2.5">
            <div className="flex gap-2.5">
              {PROMPT_CARDS.slice(0, 2).map((card, i) => (
                <button
                  key={i}
                  className={cn(
                    "flex flex-1 flex-col gap-2 rounded-[14px] p-3.5 text-left",
                    "border border-[#8A9A5B28] bg-white/63 backdrop-blur-[12px]",
                  )}
                >
                  {card.icon}
                  <span className="text-[13px] font-medium leading-[1.4] text-[#2C331EDD]">
                    {card.text}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex gap-2.5">
              {PROMPT_CARDS.slice(2, 4).map((card, i) => (
                <button
                  key={i}
                  className={cn(
                    "flex flex-1 flex-col gap-2 rounded-[14px] p-3.5 text-left",
                    "border border-[#8A9A5B28] bg-white/63 backdrop-blur-[12px]",
                  )}
                >
                  {card.icon}
                  <span className="text-[13px] font-medium leading-[1.4] text-[#2C331EDD]">
                    {card.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Composer */}
      <div className="sticky bottom-0 px-5 pb-3 pt-2">
        <ChatInput placeholder="Ask about your feelings..." />
      </div>
    </div>
  );
}

export default function InsightsPage() {
  if (!HAS_DATA) {
    return <EmptyInsights />;
  }

  return (
    <div className="flex min-h-full flex-col">
      {/* Scrollable thread */}
      <div className="flex flex-1 flex-col gap-4 px-5 pt-6 pb-4">
        {/* Header */}
        <header className="mb-2 flex flex-col gap-1">
          <h1 className="text-[28px] font-bold text-[#2C331EDD]">Insights</h1>
          <p className="text-sm text-[#6B7A48FF]">Your emotional journey</p>
        </header>

        {/* Messages */}
        {THREAD.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex",
              msg.role === "user" ? "justify-end" : "justify-start",
            )}
          >
            {msg.role === "user" ? (
              /* User bubble: olive glass, asymmetric radius — square bottom-right */
              <div
                className={cn(
                  "max-w-[80%] px-4 py-3 text-sm font-[500]",
                  "bg-[#5C6B3ABB] text-white",
                  "rounded-[16px] rounded-br-[4px]",
                  "backdrop-blur-[12px]",
                )}
              >
                {msg.text}
              </div>
            ) : (
              /* AI response: stacked components */
              <div className="flex w-full flex-col gap-3.5">
                {/* AI prose */}
                <p className="text-sm leading-[1.5] text-[#4D5A35FF]">{msg.text}</p>

                {/* Mood Summary card */}
                <div
                  className={cn(
                    "w-full rounded-[14px] p-3.5",
                    "bg-[#8A9A5B12]",
                    "border border-[#8A9A5B20]",
                  )}
                >
                  <p className="mb-3 text-[13px] font-semibold text-[#2C331EDD]">
                    How you&apos;ve been feeling
                  </p>
                  <div className="flex flex-col gap-2">
                    {MOOD_ROWS.map((row) => (
                      <div key={row.label} className="flex items-center gap-2">
                        <span className="w-[62px] text-[11px] text-[#4D5A35FF]">
                          {row.label}
                        </span>
                        <div className="relative flex-1 h-2 rounded overflow-hidden bg-[#8A9A5B20]">
                          <div
                            className="absolute inset-y-0 left-0 rounded"
                            style={{
                              width: `${row.pct}%`,
                              backgroundColor: row.fill,
                            }}
                          />
                        </div>
                        <span className="text-[11px] text-[#6B7A48FF]">{row.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Entry Card 1 */}
                <div
                  className={cn(
                    "flex w-full items-center gap-3 rounded-[14px] p-3",
                    "bg-white/63 backdrop-blur-[20px]",
                    "border border-[#8A9A5B20]",
                    "shadow-[0_2px_8px_#00000012]",
                  )}
                >
                  {/* Thumbnail placeholder */}
                  <div className="size-[72px] shrink-0 rounded-xl bg-[#8A9A5B20]" />
                  <div className="flex flex-1 flex-col gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[12px] font-semibold text-[#2C331EDD]">9:15 AM</span>
                      <span className="text-[12px] text-[#6B7A48AA]">·</span>
                      <span className="text-[11px] text-[#6B7A48FF]">Peaceful</span>
                    </div>
                    <p className="text-[12px] leading-[1.45] text-[#4D5A35FF]">
                      &ldquo;Today felt calm... like things were finally under control.&rdquo;
                    </p>
                  </div>
                  <span className="text-[#6B7A48AA]">›</span>
                </div>

                {/* Entry Card 2 */}
                <div
                  className={cn(
                    "flex w-full items-center gap-3 rounded-[14px] p-3",
                    "bg-white/63 backdrop-blur-[20px]",
                    "border border-[#8A9A5B20]",
                    "shadow-[0_2px_8px_#00000012]",
                  )}
                >
                  {/* Thumbnail placeholder */}
                  <div className="size-[72px] shrink-0 rounded-xl bg-[#8A9A5B20]" />
                  <div className="flex flex-1 flex-col gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[12px] font-semibold text-[#2C331EDD]">3:30 PM</span>
                      <span className="text-[12px] text-[#6B7A48AA]">·</span>
                      <span className="text-[11px] text-[#C49560DD]">Stressed</span>
                    </div>
                    <p className="text-[12px] leading-[1.45] text-[#4D5A35FF]">
                      &ldquo;The deadline moved up again. I can feel the tension in my shoulders.&rdquo;
                    </p>
                  </div>
                  <span className="text-[#6B7A48AA]">›</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Composer */}
      <div className="sticky bottom-0 px-5 pb-3 pt-2">
        <ChatInput placeholder="Ask about your feelings..." />
      </div>
    </div>
  );
}
