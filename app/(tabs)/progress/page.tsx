import { TrendingUp } from "lucide-react";

export default function ProgressPage() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-10 pb-4">
      {/* Icon circle */}
      <div
        className="flex size-20 items-center justify-center rounded-full"
        style={{
          backgroundColor: "#2C331E10",
          boxShadow: "inset 0 0 0 1px #2C331E12",
        }}
      >
        <TrendingUp size={32} color="#6B7A48" />
      </div>

      {/* Text group */}
      <div className="mt-6 flex flex-col items-center gap-3 text-center">
        <h1
          className="text-[28px] font-semibold leading-tight"
          style={{ color: "#2C331EDD" }}
        >
          Coming Soon
        </h1>
        <p
          className="text-[15px] leading-relaxed"
          style={{ color: "#2C331E88" }}
        >
          Streak progress tracking is on the way. Stay tuned!
        </p>
      </div>
    </div>
  );
}
