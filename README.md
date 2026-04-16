# Dear Me

A private video journal that resurfaces your own voice when you need it most.

Inspired by the gratitude jar — writing down one thing you're grateful for each day, then pulling out a note when times get rough. Dear Me digitizes that idea with video, because the most powerful voice is often your own.

## What it does

**Record** — Capture short video memos to your future self. The app transcribes your words and detects your mood automatically.

**Resurface** — The home screen brings back a past memo on meaningful days (a year ago today, a month ago, etc.). Past-you recorded it; future-you gets to watch. Today this runs on fixed timelines — the real goal is to surface the right memo *when you need to hear it*.

**Reflect** — Ask AI questions about your journal ("What's been stressing me out?" / "What am I grateful for?"). The more you journal, the better the insights.

Everything is stored locally on your device.

## Setup

Requires [Bun](https://bun.sh) and a [Groq API key](https://console.groq.com).

```bash
cp .env.example .env.local   # add your GROQ_API_KEY
bun install
bun run dev                   # localhost:3000
```

## Tech

Next.js 16, React 19, Tailwind v4, IndexedDB + OPFS (local storage), Groq (transcription + analysis).

## Contributing

This is a personal project. If you want to take it further — clone it, swap local storage for cloud, and make it yours.

## License

MIT
