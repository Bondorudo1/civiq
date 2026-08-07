# CiviQ

A civic participation app for **Cahul, Moldova**. Residents follow what the
primărie is deciding, comment on public consultations, and file complaints they
can actually track. Operators at the primărie work the other side of the same
loop from a built-in admin panel.

Mobile client only — this repo has no server. It talks to the CiviQ API
(contract **Rev 3**) and ships with a full in-memory mock, so it runs and demos
without a backend.

> **Backend developers: read [BACKEND.md](BACKEND.md).** It has the two switches
> to point this at your API, the complete list of endpoints the client calls,
> the outstanding change requests, and answers to the open questions at the end
> of the Rev 3 contract.

---

## Run it

```bash
npm install
npx expo start
```

No backend or `.env` needed — it starts on mock data. Press `a` for Android,
`w` for web, or scan the QR with Expo Go.

### Demo accounts

Any password works; the mock only reads the email.

| Role | Email | What you get |
|---|---|---|
| Resident | `ion@exemplu.md` | The citizen app, starting **unverified** |
| Primărie | `primaria@cahul.md` | The admin panel (any email containing `admin` or `primărie`) |

### The loop worth walking

It's the whole product in four steps, and it crosses both apps:

1. As a resident, file a complaint → it appears in **Sesizări** with a reference.
2. Sign out, sign in as `primaria@cahul.md` → the shell changes entirely. Open
   the complaint from the queue, set **Rezolvată**, write the explanation.
3. Sign back in as the resident → the bell has a badge; tapping it opens that
   complaint with the official response attached.
4. Try to comment on a project → you're blocked until the primărie approves your
   verification request (**Locuitori** tab on the admin side).

---

## Two apps, one binary

Role decides which shell mounts — a resident never sees admin navigation and an
operator never sees the citizen app. The split happens in
[`src/app/_layout.tsx`](src/app/_layout.tsx) via two mutually exclusive
`Stack.Protected` branches, keyed on the role persisted at sign-in.

```
src/app/
  (tabs)/          resident   Acasă · Proiecte · Sesizări · Profil
  (admin)/         primărie   Sesizări · Proiecte · Anunțuri · Locuitori · Cont
  admin/…          admin detail screens (respond, edit post, review)
  project/[id]     consultation: reactions, threaded comments, AI summary
  complaint/…      file one, track one
  ask              AI assistant over the primărie's knowledge base
  verify           resident verification request
  login, register
```

---

## How data flows

One direction, one swap point. A screen never knows whether it's talking to a
real server.

```
types.ts     the contract, shared by both implementations
    ↓
client.ts    fetch: bearer token, snake_case ⇄ camelCase, error envelope, multipart
live.ts      real endpoints          mock-data.ts + service.ts   in-memory
    ↓                                        ↓
service.ts   export const api = USE_MOCK ? mockApi : liveApi
    ↓
hooks.ts     TanStack Query — every screen goes through these
    ↓
src/app/…    screens
```

`liveApi` is **typed against `mockApi`**, so the two can't drift: if the real
implementation stops matching what screens call, it fails to compile rather than
at runtime.

**Switching to a live backend** is `USE_MOCK = false` in
[`src/api/service.ts`](src/api/service.ts) plus `EXPO_PUBLIC_API_URL` in `.env`
(copy `.env.example`). Nothing else changes.

---

## Domain rules the client encodes

Worth knowing if you're changing behaviour — most of these mirror server rules,
and a few are UI-only.

- **Participation is gated.** Anyone may register and read. Commenting, reacting
  and filing a complaint unlock only after the primărie *approves* a
  verification request — submitting one is not enough. Gated controls stay
  visible and explain themselves rather than disappearing.
  *Not in Rev 3 — see BACKEND.md §3.1. The server must enforce this too.*
- **30 days to answer.** Complaints show a countdown against the response
  window; the admin queue leads with how many are overdue.
- **Closing owes an explanation.** A complaint moving to Rezolvată/Respinsă
  requires `admin_response`; a consultation can't close without a verdict.
  Status changes notify the author, text-only edits don't.
- **Closed consultations refuse comments** (`409 POST_CLOSED`), so the composer
  is replaced rather than left to fail.
- **Official replies look official.** The city answering under its own
  consultation renders as a sealed nameplate, inferred from
  `comment.author.id === post.author.id` — the contract has no author role yet.
- **AI is synchronous and can be down.** Every AI call shows a spinner and
  treats `503 AI_UNAVAILABLE` as a soft, retryable state with the button still
  live.

---

## Stack

Expo SDK 57 · React Native 0.86 · React 19 · expo-router (typed routes,
file-based) · TanStack Query for server state · Zustand + AsyncStorage for auth ·
Reanimated 4 · TypeScript throughout.

Design language and product decisions live in [PRODUCT.md](PRODUCT.md) and
[PLAN.md](PLAN.md). UI text is Romanian.

## Checks

```bash
npx tsc --noEmit
```

```bash
npx expo export --platform android
```

Both must exit 0. The export catches bundler and native-resolution problems that
typechecking alone misses.
