# Rotoskill — project context

@AGENTS.md

Read this first in every session. It records the product decisions behind the code, so a new session doesn't have to rediscover them.

## What it is

A mobile app for practicing and tracking **any** skill. Articulation is the first example, but the app must stay general: no screen or code path may assume a specific skill.

- Owner: Hamzamelad. Part of the owner's `roto-` app family (rotodash, rotocash, rotozone).
- Audience: **public product**, published to the app stores, not a personal tool.
- Platform: **mobile first** (Expo SDK 58, Expo Router, TypeScript). Web isn't a goal.
- Origin idea: a video on why turning thoughts into speech is hard (working memory works like RAM) and how to improve: pick one main point, simplify, choose clarity over fancy words, record yourself and review.

## Core idea: one practice loop, any skill

**Today → Session → Review → Progress**

A skill is a **practice pack**:
- **Principles:** short rules (e.g. "One main point").
- **Drills:** exercises of a generic type: `record` | `write` | `timed` | `log`, with a target duration and optional prompts.
- **Metrics:** the review checklist, with a generic kind: `scale` (1–5) | `count` | `boolean` | `duration`, plus `higherIsBetter`.

A **Rep** is one attempt and stores `scores[metricId]`. Progress charts every metric automatically. **Rule:** new skills are data, never new code. If a feature only works for one skill, redesign it around these generic types.

## Decisions made

- Onboarding matters more than features for a public app: start from **templates** so the first rep happens within seconds.
- Privacy by default: recordings and data stay **on the device** (expo-sqlite kv-store + `directory: 'document'` recordings). Sharing is opt-in later.
- State: one small persisted store in `src/lib/store.tsx` (no Redux or Zustand). Keep it that way until sync/accounts arrive.
- No chart library: `src/components/bar-chart.tsx` is enough for now.
- Creating a skill "from a summary or notes" (AI) is **shown as "Soon"** in `skill/new.tsx`. It isn't built yet.
- AI feedback on recordings is planned as the **paid** feature, because each use costs money.

## Roadmap

- **v1 (done, commit a282a51):** templates (Articulation, Writing clearly, Drawing basics), pack editor, record/write/timed/log sessions, self-review checklist + note, per-metric trends, first-vs-latest comparison, streak.
- **Next, before new features:** run it on a real device and fix whatever feels wrong. Not yet tested on a device or emulator; only `tsc`, `expo lint` and an Android bundle export have passed.
- **v2:** generate a pack from a pasted summary or transcript (AI), daily reminder notifications, onboarding flow, real app icon and splash (still Expo placeholders), license (none yet: the template's Expo MIT file was removed).
- **v3:** transcription and AI feedback on recordings (filler-word count etc.), shareable public skill packs, accounts and sync.

## Design

Mockups (7 phone screens, Design canvas): https://claude.ai/artifact/BrLt9yiCC4MQA8v4AAGLDb
Row 1: Today, Session, Review, Progress. Row 2: Skills, New skill, Your pack.

Look: calm and focused. Light screens with dark "focus" surfaces (the drill card on Today, the whole Session screen). Tokens live in `src/constants/theme.ts`:
- bg `#F4F5F7`, card `#FFFFFF`, ink `#14171C`, muted `#59606C`, border `#E3E6EB`
- accent `#2F55D4` (each skill also has its own `color`), streak `#B4410C`, good `#0F766E`
- Radius 10–22, touch targets ≥ 44 px, text contrast ≥ 4.5:1. No emoji in the UI.

## Conventions

- Routes only in `src/app/`. Everything else goes in `src/components` or `src/lib`.
- Navigate with object hrefs: `router.push({ pathname: '/skill/[id]', params: { id } })`.
- Install packages with `npx expo install`. In the cloud sandbox the Expo API is blocked, so there use `npm install <pkg>@<version from node_modules/expo/bundledNativeModules.json>`.
- Before committing: `npx tsc --noEmit` and `npx expo lint` must pass.
