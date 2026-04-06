export interface Memo {
  id: string;
  date: string;
  time: string;
  duration: string;
  transcript: string;
  note?: string;
  moods: string[];
  thumbnailUrl?: string;
}

export const MOCK_MEMOS: Memo[] = [
  {
    id: "1",
    date: "March 23, 2026",
    time: "2:30 PM",
    duration: "3:42",
    transcript:
      "Work has been a lot lately. Everything piling up at once.",
    moods: ["overwhelmed"],
    thumbnailUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
  },
  {
    id: "2",
    date: "March 23, 2026",
    time: "8:15 AM",
    duration: "0:58",
    transcript:
      "Today felt peaceful. Morning light helps.",
    moods: ["calm", "grounded"],
    thumbnailUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
  },
  {
    id: "3",
    date: "March 22, 2026",
    time: "6:45 PM",
    duration: "1:15",
    transcript: "That was tough, but I handled it.",
    moods: ["resilient", "growth"],
    thumbnailUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop",
  },
  {
    id: "4",
    date: "March 22, 2026",
    time: "11:20 PM",
    duration: "2:08",
    transcript:
      "I dont really know what Im doing anymore.",
    moods: ["lost"],
    thumbnailUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop",
  },
];

export const MOOD_OPTIONS = [
  { emoji: "😊", label: "Happy" },
  { emoji: "😌", label: "Calm" },
  { emoji: "😢", label: "Sad" },
  { emoji: "😰", label: "Anxious" },
  { emoji: "🤩", label: "Excited" },
];

export const TIME_FILTERS = ["This Week", "This Month", "3 Months", "All Time"];
export const EMOTION_FILTERS = [
  "All",
  "Overwhelmed",
  "Calm",
  "Resilient",
  "Lost",
];

export const INSIGHT_PROMPTS = [
  { emoji: "🌿", text: "How have I been feeling lately?" },
  { emoji: "☀️", text: "When do I feel most at peace?" },
  { emoji: "🌱", text: "Am I handling stress better?" },
  { emoji: "❤️", text: "What makes me happiest?" },
];

export const WEEKLY_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const DAILY_PROMPTS = [
  "What are you grateful for right now?",
  "How are you really feeling right now?",
  "What made you smile today?",
  "What's been on your mind lately?",
  "What would you tell your future self?",
];

export const STREAK_MEMOS: Memo[] = [
  {
    id: "s1",
    date: "Wednesday, March 26",
    time: "9:15 AM",
    duration: "0:42",
    transcript:
      '"Today felt calm... like things were finally under control."',
    moods: ["calm", "grounded", "hopeful"],
    thumbnailUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
  },
  {
    id: "s2",
    date: "Wednesday, March 26",
    time: "1:30 PM",
    duration: "1:15",
    transcript:
      '"Had a great lunch with Sarah. Felt so grateful for friendships that last."',
    moods: ["grateful", "friendship", "joy"],
    thumbnailUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
  },
  {
    id: "s3",
    date: "Wednesday, March 26",
    time: "9:45 PM",
    duration: "2:08",
    transcript:
      '"Long day. Maybe that\'s okay \u2014 not every day has to be perfect."',
    moods: ["reflective", "growth"],
    thumbnailUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop",
  },
];
