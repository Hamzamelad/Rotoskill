# Rotoskill

Practice and track **any** skill. Rotoskill doesn't know what articulation, drawing or writing is. It only knows a practice loop:

**Today → Session → Review → Progress**

1. **Today** suggests a drill and one principle to focus on.
2. **Session** runs the drill: record audio, write, or just time yourself.
3. **Review** scores the rep against your own checklist and saves one note on what to fix.
4. **Progress** charts every metric over time and puts your first rep next to your latest.

## The model

A skill is a **practice pack**:

| Part | What it is | Example (Articulation) |
| --- | --- | --- |
| Principles | Short rules to keep in mind | "Pick one main point before you speak" |
| Drills | Exercises: `record`, `write`, `timed`, `log` | "One-point explanation", 60 s, record |
| Metrics | The review checklist: `scale` (1–5), `count`, `boolean`, `duration` | "Filler words", count, lower is better |

Every rep stores its scores per metric, so new skills need no new code. Types live in `src/lib/types.ts`.

## Project layout

```
src/
  app/                 # Expo Router routes
    (tabs)/            # Today, Skills, Progress (native tabs)
    session/[drillId]  # run a drill (recording via expo-audio)
    review/[repId]     # score a rep
    skill/new          # create from template or scratch
    skill/[id]         # edit a practice pack
  components/          # UI building blocks, metric inputs, audio player, bar chart
  lib/
    types.ts           # data model
    store.tsx          # persisted store (expo-sqlite kv-store)
    templates.ts       # starter packs: Articulation, Writing clearly, Drawing basics
    stats.ts           # streaks, series, formatting
```

Data and recordings stay on the device for now.

## Run it

```bash
npm install
npx expo start
```

The app uses native modules (`expo-audio`, `expo-sqlite`). If Expo Go doesn't include the versions it needs, make a development build:

```bash
npx expo run:android      # or run:ios on a Mac
# or in the cloud
npx eas-cli@latest build --profile development
```

Before committing:

```bash
npx tsc --noEmit
npx expo lint
```

## Roadmap

- **v1 (this):** templates, pack editor, record/write/timed drills, self-review, trends, streak
- **v2:** generate a pack from a pasted summary or transcript (AI), daily reminder notifications, onboarding
- **v3:** AI feedback on recordings (transcript, filler-word count), shareable public packs, accounts and sync
