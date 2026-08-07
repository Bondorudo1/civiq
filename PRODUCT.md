# Product

<!-- impeccable:product-schema 1 -->

## Platform

android

<!-- Shared cross-platform look: one CiviQ design language on both iOS & Android (Expo/React Native).
     Primary demo/reference OS recorded as Android (INFERRED — user deferred the choice; Moldova's
     market skews Android, best matching real Cahul residents). iOS is at parity under the same
     shared design language. Flip to `ios` if the demo device changes. Not `adaptive`: the design
     language is deliberately shared, not divergent per OS. -->

## Stack

Expo (managed) + React Native + TypeScript, expo-router (file-based). TanStack Query (server
state) + Zustand (auth/UI state). i18next + react-i18next + expo-localization (RU/RO).
react-native-maps + expo-location; expo-image-picker. Decided by the existing scaffold
(`package.json`, `app.json`) and PLAN.md — not an open question.

## Users

Primary: **Cahul residents (citizens)** on their personal smartphones (often Android), RU- or
RO-speaking, checking city matters on the go or at home. Their jobs: stay informed on official
city consultations, voice their opinion (react / discuss), report local problems (complaints),
and receive city + utility (Premier Energy) notices.

Secondary (not a user of *this* app): city hall staff, who operate a **separate admin panel**
that is out of scope for this product.

## Product Purpose

A civic-participation channel between **Cahul city hall (primăria) and its residents** — the
single legitimate place to read official consultations, participate in them, report local
problems, and get city + utility notifications. Success = residents treat it as the real,
trusted city channel and actually use it to participate and report. Hackathon MVP (deliberately
a scoped subset, not a full product).

## Positioning

City-specific to **Cahul** (not a generic gov template) and **bilingual RU + RO** — deliberately
**no Gagauz** (Cahul is not a Gagauz city, unlike the Comrat "VOICE" reference). Its differentiated
mechanism: it folds **official city consultations + citizen complaints + the Premier Energy Cahul
maintenance/outage feed into one login-gated civic flow** for a single city, in RU/RO — a
combination a neighboring generic civic or utility app would not truthfully offer.

## Operating Context

Residents on personal phones with intermittent mobile connectivity. Backend is built fresh by a
**teammate in Python** (base `http://localhost:8000/api`; single **7-day token, no refresh**);
reads are left public server-side and the **app gates all access on top**. Several backend
change-requests are still pending (PLAN.md §9), so the app must **not hard-depend on the API** —
it runs on a **mock service layer now, swappable to the real API via one flag**. City staff use a
separate admin panel (out of scope). Timeline is a hackathon — MVP scope.

## Capabilities and Constraints

**In scope**
- Auth: login + register (email, password, name, locale); the whole app is login-gated.
- Posts (city-authored consultations): list + type/category filter tabs; like/dislike; threaded
  comments (one level, comments also react); official verdict/outcome when a post is closed.
- Complaints (citizen-authored): create (category, title, description, optional photo, conditional
  map pin); "my complaints" list with status; detail with the city's single response + status.
- Notifications: city announcements **+ Premier Energy Cahul outage feed in one flow**; unread
  badge; complaint-status-change notifications.
- Profile: name, email, language (RU/RO), logout.

**Constraints & terminology**
- Languages: **RU + RO only** (no Gagauz).
- 8 fixed complaint categories: ROADS, LIGHTING, WATER, GARBAGE, TRANSPORT, LANDSCAPING,
  BUILDINGS, OTHER. Map pin shown **only for location-relevant** categories (not TRANSPORT/OTHER).
- Auth: single 7-day token, no refresh.
- Terms: *primăria* (city hall); "posts"/consultations; "complaints"; Premier Energy (utility
  outage source).

**Deliberately out of scope**: advisory voting/polls, recommendations register, gamification
(points/tiers/rewards/leaderboard), Gagauz, password reset, email verification, complaint chat
thread, complaint confirm/rating/reopen, heavy accessibility settings.

## Brand Commitments

- **Name:** CiviQ (working name).
- **Symbol (binding, confirmed this session):** the **white water lily — *nufăr alb* (*Nymphaea
  alba*)**, Cahul's signature emblem (its "Nufărul Alb" festival and spa resort). It is **a water
  lily, NOT a lotus** (floats flat on the water; a lotus stands upright on a stalk).
- **Voice (user-directed — match the VOICE app's register):** warm, approachable, participatory,
  respectful. Second-person, **polite-formal** (RU «вы» / RO politeness), inviting residents to
  "take part in the life of the city." Human and encouraging, never bureaucratic or cold.
- **Languages:** RU + RO are both first-class (RU likely the reference locale, RO at parity).
- **Visual identity is NOT to reuse VOICE's look** — that is a separate decision recorded in
  DESIGN.md. VOICE is a reference for scope and copy voice, and an anti-reference for visuals.

## Evidence on Hand

- `PLAN.md` — the MVP build plan; single source of truth for scope, entities, and build order.
- **VOICE reference monorepo** at `C:\Users\iliac\Desktop\hackathon` (its `apps/citizen` is a
  Vite **web** app) — reference for scope and copy voice, anti-reference for visual design. CiviQ
  does **not** share its codebase or look; do not fabricate that it does.
- Backend contract reviewed; change-requests sent (PLAN.md §9). Backend **not yet ready** — mock
  data only.
- **Absences future work must not fabricate:** no real user content, no screenshots, and **no
  official Cahul emblem SVG or official brand colors yet** (a locked placeholder palette, "Nufăr
  Alb", lives in PLAN.md §4 / DESIGN.md until the real emblem is provided).

## Product Principles

1. **Legitimacy first** — it must read as the real primăria channel, not social media or rumor.
2. **Lower the barrier to voice** — reading, reacting, discussing, and reporting a problem must be
   fast and unintimidating for any resident.
3. **Close the loop** — anyone who reports or engages can see what happened (status, official
   response, verdict). No dead ends.
4. **Bilingual by default** — RU and RO are equal first-class languages, never an afterthought.
5. **Ship the MVP** — the cut list is deliberate; stay mock-first so the app never blocks on the
   backend.

## Accessibility & Inclusion

Core inclusion requirement is **bilingual RU/RO parity**. The heavy accessibility settings suite
seen in VOICE (color modes, font scaling, reduce-motion, high-contrast toggles) is **deliberately
out of scope** for this MVP; baseline **WCAG AA** legibility is still expected in the palette and
components.
