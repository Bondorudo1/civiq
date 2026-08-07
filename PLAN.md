# CiviQ — Cahul citizen app · build plan

> Single source of truth for the MVP. Nothing is implemented yet — this file is the plan.
> Project name: **civiQ**. The original Comrat "VOICE" repo (at `C:\Users\iliac\Desktop\hackathon`) is **reference only**.

---

## 1. What this is

A **civic-participation mobile app for the city of Cahul, Moldova**. The city hall (primăria)
posts topics; citizens read them, react, and discuss; citizens also file complaints that go to
the city; and everyone gets city + utility notifications. Hackathon MVP — deliberately not full.

- **Users:** Cahul residents (citizens) on their phones. City staff use a separate admin panel (not in this app).
- **Languages:** **RU + RO** (no Gagauz — Cahul is not a Gagauz city).
- **Access:** **login required for everything** (enforced in the app; backend leaves reads public, we gate on top).

## 2. Platform & stack

- **React Native + Expo (managed)**, TypeScript, **expo-router** (file-based). Real native app (iOS + Android).
- **State/data:** TanStack Query (server state) + Zustand (auth/UI state).
- **Maps:** react-native-maps + expo-location (for location-based complaints).
- **Photos:** expo-image-picker.
- **i18n:** i18next + react-i18next + expo-localization (RU/RO).
- **Data access behind a typed service layer** with **mock data now**, swappable to the real API via one flag.

### Dependencies — already installed ✅
`@tanstack/react-query`, `zustand`, `@react-native-async-storage/async-storage`, `expo-location`,
`expo-image-picker`, `react-native-maps`, `i18next`, `react-i18next`, `expo-localization` are all in
`package.json`. `expo-localization` plugin is registered in `app.json`.

## 3. Backend

Built by a **teammate in Python** (fresh). Base `http://localhost:8000/api`. Single 7-day token, no refresh.
Contract reviewed; agreed changes requested (see §9). App must not hard-depend on the API before it's ready —
hence the mock service layer.

## 4. Design identity — Cahul water lily (nufăr alb)

Cahul's emblem is the **white water lily** — *nufăr alb* (*Nymphaea alba*), **not a lotus**
(confirmed: the flower floats flat on the water surface; a lotus stands upright on a tall stalk).
It is the city's signature symbol — the biennial **"Nufărul Alb"** folk festival and the
**"Nufărul Alb"** spa resort both carry the name; regional heraldry depicts a white water lily
on azure. The design plays on this.

- **Logo mark:** minimal, geometric **white water lily** — a flat star of pointed petals with a
  small golden center, resting on calm water. Generated as SVG (Codex asset prompt);
  placeholder until/if the official Cahul emblem SVG is provided.
- **Palette — "Nufăr Alb" (locked):** cool lake-water base + lily-pad green support + one warm
  **coral petal** accent. Deliberately the opposite temperature from VOICE (warm terracotta/
  amber/gold) — same clean civic manner, entirely different color world.

  | Role | Token | Hex |
  |---|---|---|
  | Brand / Water | `water-600` | `#0E7490` |
  | Water deep | `water-800` | `#0B4F5A` |
  | Water bright | `water-400` | `#22A5BD` |
  | Water wash | `water-50` | `#EAF6F8` |
  | Lily-pad (support / success) | `pad-600` | `#2E7D5B` |
  | Pad wash | `pad-50` | `#E7F3EC` |
  | Petal accent | `petal-500` | `#F2637A` |
  | Petal pressed | `petal-600` | `#D94E66` |
  | Petal wash | `petal-50` | `#FDECEF` |
  | Ink (text) | `ink-900` | `#12303A` |
  | Muted text | `ink-500` | `#5A7078` |
  | Border / line | `line` | `#DCE6E9` |
  | Surface | `surface` | `#FFFFFF` |
  | App background | `bg` | `#F5F9FA` |
  | Golden center (logo only) | `gold` | `#E0A400` |

  **Status pills:** NEW `#0E7490` · IN_PROGRESS `#B26A00` · RESOLVED `#2E7D5B` · REJECTED `#C0453B`.
  **Theme: light only** — dark theme intentionally dropped (per decision).

- **Feel:** modern, clean, airy — "civic but calm."
- Tokens wired so the official Cahul emblem + any exact brand colors swap in later with one change.
- Design guided by the **Impeccable** skill. Full 50–900 token scales + component specs live in
  `DESIGN.md` (produced via `/impeccable shape` / new-work).

## 5. Feature scope

**In:**
- Auth: login + register (email, password, name, locale). Login-gated app.
- Posts (city-authored consultations): list + detail, **type/category filter tabs**, **like/dislike**, **threaded comments** (comments also like/dislike), **official verdict/outcome** when closed.
- Complaints (citizen-authored): create form with **category**, title, description, optional **photo**, **conditional map pin**; list of my complaints; detail with the city's single response + status.
- Notifications: city announcements + **Premier Energy = Cahul city maintenance/outage feed** (all in one flow, not per-district); unread badge; complaint-status-change notifications.
- Profile: name, email, language (RU/RO), logout.

**Out (deliberately):** advisory voting/polls, formal recommendations register, gamification (points/tiers/rewards/leaderboard), Gagauz, password reset, email verification, complaint chat thread, complaint confirm/rating/reopen, heavy accessibility settings.

## 6. Screens & flow

**UI naming — aligned to VOICE** (data entities stay `Post` / `Complaint` internally; these are the *displayed* labels):
- Posts tab → **Projects** — RU **Проекты** / RO **Proiecte** (aria: "Проекты и инициативы" / "Proiecte și inițiative").
- Complaints tab → **Sesizări** (RO) / RU **Обращения** — the citizen's reports to the city.
- Home → RU Главная / RO Acasă. Profile → RU Профиль / RO Profil.

Login-gated → bottom tabs: **Home · Projects · Sesizări · Profile** (+ notifications bell in the header).
*(Nav count still open: this 4-tab + header-bell model vs. the original 5-tab plan with a Notifications tab.)*

| Screen | Shows / does |
|---|---|
| Login | email + password → app; links to register; language switch |
| Register | name, email, password, locale (RU/RO) |
| Home | **VOICE Acasă structure, no gamification:** (1) hero card — greeting + name + water-lily badge (no points/tier); (2) 2×2 **quick-actions** grid — Report a problem, Projects, Notifications, Contacts; (3) **recent Projects** list. Leaderboard/points/rewards omitted. |
| Posts (list) | all posts; filter tabs by type/category; like/comment counts |
| Post detail | post body + image; **like/dislike**; **threaded comments** (each with like/dislike); if closed → outcome |
| Outcome | the city's official verdict for a closed post |
| Complaints (list) | my complaints with status pills; "+ new" |
| New complaint | category picker; title; description; **map pin (only for location-relevant categories)**; optional photo |
| Complaint detail | complaint + status + city's single response |
| Notifications | city announcements + Premier Energy Cahul feed; mark read; unread badge |
| Profile | name/email, language (RU/RO), logout |

## 7. Data entities (from the backend contract)

- **User:** id, email, full_name, role (CITIZEN/ADMIN), locale (ru/ro), created_at.
- **Post:** id, title, body, image_url, lang, status (OPEN/CLOSED), verdict, closed_at, author, likes_count, comments_count, liked_by_me, created_at. **(requesting: type/category, dislikes)**
- **Comment:** id, post_id, author, text, created_at, can_delete. **(requesting: like/dislike, parent_id for replies)**
- **Complaint:** id, title, description, category, address, photo_url, status (NEW/IN_PROGRESS/RESOLVED/REJECTED), admin_response, author, created_at, updated_at. **(requesting: optional lat/lng)**
- **Announcement:** id, kind (MANUAL/PARSED), source (premier_energy|null), title, body, payload (parsed: work_type, url, segments[{streets,time_start,time_end,reason}]), event_date, is_read, created_at.

## 8. Complaint categories + map rule

Final list = backend's 8: `ROADS, LIGHTING, WATER, GARBAGE, TRANSPORT, LANDSCAPING, BUILDINGS, OTHER`
(labels RU/RO on the frontend).

**Map pin shown only for location-relevant categories** → ROADS, LIGHTING, WATER, GARBAGE, LANDSCAPING, BUILDINGS.
**No map** → TRANSPORT, OTHER. So `lat`/`lng` are optional.

## 9. Backend change requests (sent to Python dev)

1. Post **dislikes** — reaction LIKE/DISLIKE; `likes_count`, `dislikes_count`, `my_reaction`; `POST /posts/{id}/react`.
2. **Comment reactions** — same like/dislike fields on Comment + `POST /comments/{id}/react`.
3. **Threaded comments** — `parent_id` on Comment (one level).
4. **Post type/category** — add `type` (e.g. HEARING | DRAFT_DECISION) and/or category + `?type=` filter on `GET /posts`.
5. **Complaint geolocation** — optional `lat`/`lng` on Complaint, accepted in `POST /complaints`.
6. **Complaint-status-change notifications** — add (dev estimated ~1h).
7. **Announcements sort** — by `event_date` (soonest first).
8. **Categories** — keep the 8 above.
9. Gagauz **not** needed — ru/ro is correct (Cahul).

Keep as-is: post `verdict`, announcement model (MANUAL/PARSED premier_energy), static image URLs, one object in list+detail, single 7-day token, public posts (we gate in-app), `PATCH /me` for locale, pagination from 1.

## 10. Build order

1. Foundation — theme tokens (Cahul lotus palette), navigation shell (auth stack + tabs), fonts.
2. Mock service layer + TS types (mirrors the contract) + seed data.
3. Auth — login / register, token persistence, login gate.
4. Posts — list (+ filter tabs) → detail (like/dislike + threaded comments) → outcome.
5. Complaints — list → new (conditional map + photo) → detail.
6. Notifications (city + Premier Energy Cahul feed) + Profile (language, logout).
7. i18n RU/RO pass.
8. Swap mock → real API (flip flag) when backend is ready.

## 11. Open items

- Official Cahul emblem SVG + exact brand colors (using placeholder lotus + blue/teal/green until provided).
- Google Maps API key (for react-native-maps) — needed for the complaint map.
- Confirm final RU/RO copy for category labels and notification titles (incl. Premier Energy work_type labels).
- Official Cahul emblem SVG (using the placeholder water-lily enamel badge until provided).
- Google Maps API key (for react-native-maps) — needed for the complaint map.
- Confirm final RU/RO copy for category labels and notification titles (incl. Premier Energy work_type labels).
- ✅ `/impeccable init` done (→ PRODUCT.md). DESIGN.md is written at build-finish (from the built screens), per Impeccable.

## 12. Locked design direction (shape) — "Enamel Civic" (Placă Emailată)

**Thesis:** CiviQ looks like Cahul's own civic **signage system** on your phone — enameled plaques,
modernized into a clean Material 3 interface. Trustworthy, glanceable, quietly branded through the
city's water colors. It refuses the generic friendly-blue "gov app" template.

**World grammar** (all screens inherit this; palette = §4):
- **Enamel plaques** — rounded-rect cards (~16dp) with a self-colored edge + one hairline sheen
  (never a gloss gradient). Category chips = enamel tags; status = enamel stamps.
- **Color** — light/airy ground; teal owns regions (app bars) like painted signage; **coral is the
  single action/live accent** (report CTA, active like, unread dot); the **enamel color-code**:
  Transport=teal, Mediu=green, Buget/maintenance=amber, status reds for reject.
- **Type** — `Rubik` (rounded grotesk, full Cyrillic + Romanian) themed through the Material type scale.
- **Icons** — signage pictograms (thick uniform stroke) in enamel color tiles.
- **Motion** — Material (container transform plaque→detail, fade-through tabs, coral "stamp" on react).
- **Theme** — light only (dark theme intentionally dropped).

**Naming:** tabs Acasă · Proiecte · Sesizări · Profil + header bell.
**Home = VOICE Acasă layout, no gamification:** hero card → 2×2 quick-actions → recent Projects list.
**Platform:** Android-primary, shared cross-platform look, Material 3 correct (system Back, insets, FAB).

Mocks approved: Home, Projects list, Project detail. Remaining screens (Contact flow, Notifications,
Profile, Auth) to be designed in this same world.
