# CiviQ frontend → backend handoff

Frontend for the Cahul civic app: an Expo / React Native client covering the
resident app and the primărie panel. Built against **API contract Rev 3**.

It currently runs on an in-memory mock, so it demos without a backend. Pointing
it at the real API is a two-line change — see below.

---

## 1. Running it against your API

```bash
npm install
cp .env.example .env        # set EXPO_PUBLIC_API_URL
npx expo start
```

Two switches:

| Where | Change |
|---|---|
| `.env` | `EXPO_PUBLIC_API_URL=http://<host>:8000/api` |
| `src/api/service.ts` | `export const USE_MOCK = false` |

`localhost` resolves to the *phone* on a physical device — use the machine's LAN
IP when testing on hardware, not `localhost`.

Everything else is already handled in `src/api/client.ts`:

- `Authorization: Bearer <token>` from the auth store
- deep **snake_case ↔ camelCase** conversion in both directions
- the `{ code, message, fields }` error envelope, thrown as-is so screens can
  branch on `code`
- `multipart/form-data` for the two endpoints that carry files

**`src/api/live.ts` is the authoritative list of what the client calls.** If an
endpoint there doesn't match your implementation, that's the bug — it's typed
against the mock, so both sides are guaranteed to have identical signatures.

---

## 2. Answers to the open questions in Rev 3

You asked six questions at the end of the contract. From the built UI:

**Resource naming — keep the single `/notifications`.** The client has one bell,
one unread count, one feed with a `kind` filter. Splitting into `/announcements`
plus `/me/notifications` would mean two sources, two counters and a client-side
merge. Don't split.

**Reply pagination — not needed.** Replies render inline under their root, one
level deep, exactly as Rev 3 returns them. Cahul-scale threads don't justify the
extra endpoint.

**Notify on `admin_response`-only edit — no, keep current behaviour.** Notifying
only on status change is right. Operators routinely fix wording right after
sending; a second notification for a typo would train residents to ignore the
bell. The admin UI already warns that *changing the status* notifies the author.

**Post types — keep all five.** `NEWS`, `HEARING`, `DRAFT_DECISION`,
`DISCUSSION`, `OTHER` each have a label, icon and colour in
`src/constants/civic.ts`, and drive the filter chips on the Proiecte screen.
`DISCUSSION` earns its place (open-ended vs. announcement); `OTHER` is the
escape hatch. No renames needed.

**One axis or two — one is enough.** The filter UI is a single row of chips.
A second independent axis would need a second row and a compound empty state for
little gain. Don't add `category` to posts.

**Notification sorting — the formulation is correct.** Upcoming ascending, then
past descending. Your noted side effect (personal `COMPLAINT_STATUS` items have
no `event_date`, so they sink below future outages) is mitigated client-side:
the feed now has `kind` tabs including "Sesizările mele". If it's cheap, ordering
unread first *within* each block would help; not a blocker.

---

## 3. Change requests

### 3.1 Resident verification — **new, and the client already depends on it**

Anyone may register and read. Commenting, reacting and filing a complaint unlock
only after the primărie approves a verification request. Submitting is not
enough — approval is the gate.

Add to `User`:

```json
{ "verification": "UNVERIFIED | PENDING | VERIFIED | REJECTED" }
```

`VerificationRequest`:

```json
{
  "id": "uuid",
  "user": { "id": "uuid", "full_name": "Ion Popescu" },
  "idnp": "2004008123456",
  "address": "str. Independenței 24, ap. 3",
  "status": "PENDING",
  "reason": null,
  "created_at": "2026-08-07T10:00:00Z"
}
```

| Endpoint | Access | Notes |
|---|---|---|
| `POST /api/me/verification` | authenticated | body `{ idnp, address }`; IDNP is 13 digits → 422 otherwise. Sets the user to `PENDING`. Returns the updated `User`. |
| `GET /api/admin/verifications` | ADMIN | paged, newest first |
| `PATCH /api/admin/verifications/{id}` | ADMIN | body `{ status: "VERIFIED" \| "REJECTED", reason? }`. `reason` **required** when rejecting, same rule as `admin_response` on complaints. |

Server side, approving must flip the user's `verification` and — matching the
complaint pattern — create a notification for that resident.

Enforcement belongs on the server too: `POST /posts/{id}/comments`,
both `/react` endpoints and `POST /complaints` should refuse an unverified user
(`403`, ideally with a distinct code such as `NOT_VERIFIED`). The client gates
the UI, but that's convenience, not security.

### 3.2 `author.role` — optional, small, high value

`Post.author` and `Comment.author` return only `{ id, full_name }`. The client
renders official replies as a distinguished nameplate, and currently has to infer
"official" from `comment.author.id === post.author.id`. That breaks the moment a
second admin account posts.

Adding `role` (and optionally `title`, e.g. `"Primar"`) to the author object
would be a serializer change on your side and would let us mark who is speaking.
Not a blocker — we ship without it.

### 3.3 Complaint registry number — informational

There's no human-quotable reference on `Complaint`, so the client displays the
first 8 hex characters of the UUID (`#3A91C4F2`). Fine for the MVP. If the
primărie has a real registry format, expose it and we'll use it.

---

## 4. Things to know about the client

- **Lists request `size=100` and read `.items`.** No infinite scroll yet — a
  deliberate MVP shortcut, noted in `client.ts`.
- **AI endpoints** are wired with spinners and treat `503 AI_UNAVAILABLE` as a
  soft, retryable state that keeps the button enabled, per your guidance.
- **`409 POST_CLOSED`** never fires from the UI: the composer is replaced with a
  "consultation closed" bar on closed posts.
- **Validation is mirrored client-side** (field lengths, IDNP shape, photo type
  and 10 MB limit) so users see errors before a 422/413.
- `409 EMAIL_TAKEN` and `401` on login have dedicated copy; `401` is deliberately
  vague about whether the address exists.

## 5. Layout

```
src/api/         types.ts · client.ts · live.ts · service.ts · hooks.ts · mock-data.ts
src/app/         expo-router routes — (tabs) resident, (admin) primărie, admin/* detail
src/components/  shared UI kit
src/hooks/       use-theme, use-verification
```

`service.ts` is the only file that decides mock vs. live.
