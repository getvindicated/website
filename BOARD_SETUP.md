# Setting up the board hubs

Each chapter has its own board hub: UC Berkeley at `/board`, UCLA at
`/board/ucla`. They run the same code and share one database, where every
row belongs to a chapter. Neither hub is linked from the site, and both
tell search engines not to index them. To see anything, people need their
chapter's password; a Berkeley password never opens UCLA's hub, or the
reverse.

Per-chapter settings (teams, labels, Projects content, who submissions are
emailed to) are in `lib/board/chapters.ts` and `lib/board/chapter-server.ts`.

## Passwords

### Berkeley (`/board`)

| Railway variable         | Who gets it          | What it unlocks                         |
| ------------------------ | -------------------- | --------------------------------------- |
| `BOARD_PASSWORD`         | everyone on the board | view everything, submit assignments     |
| `BOARD_SOCIALS_PASSWORD` | no one yet           | also add, edit and delete socials       |
| `BOARD_ADMIN_PASSWORD`   | Rana                 | edit everything                         |

No one edits socials right now, so leave `BOARD_SOCIALS_PASSWORD` unset
until Rana names someone; until then only the admin can change socials.
Use different passwords for each role. People stay signed in on a device for 30
days. To remove someone's access, change the password they used; that
signs out everyone who used it, and you share the new one with the rest.

### UCLA (`/board/ucla`)

| Railway variable            | Who gets it             | What it unlocks                       |
| --------------------------- | ----------------------- | ------------------------------------- |
| `BOARD_UCLA_PASSWORD`       | everyone on the UCLA board | view everything, submit deliverables |
| `BOARD_UCLA_ADMIN_PASSWORD` | Fiona and Will          | edit everything on the UCLA hub       |

Use passwords that differ from Berkeley's.

Ten wrong tries from the same connection lock a hub's form for 15 minutes.

## Submissions

The Assignments tab's form emails each submission through Brevo, with
reply-to set to the submitter's email (members with none on file are asked
for one).

- Berkeley: to Rana.
- UCLA: to Fiona and Will, Cc Rana. Submissions from the App Dev and Data
  teams also go to Rizwaan.

The recipient lists are in `lib/board/chapter-server.ts`.

## What admins can edit

Signed in with a chapter's admin password, everything on that chapter's hub
has an Edit link: the subtitle, members and teams, the photo row, quick
links, key dates, the Projects tab (projects, descriptions and every week of
the timeline), assignments (including past weeks), announcements, events,
meetings, the board meeting time, and Berkeley's rule. Changes save to the
database; nothing needs a code change. The starting content comes from
`lib/board/chapters.ts`.

One exception: the UCLA submission routing matches the team names "App Dev"
and "Data" in `lib/board/chapter-server.ts`. If either team is renamed on
the hub, update that list too or Rizwaan stops getting those submissions.

The **Changes** tab (admins only) lists every change, newest first, with
what changed and a **Restore previous version** button. Everyone shares
the admin password, so admins can type their name once per browser; the
log shows it as self-reported.

## Announcement emails

Posting an announcement can email it to the chapter ("Email this to
everyone", on by default): one email per person through the Brevo API, so
no one sees anyone else's address. Admins-only announcements go to the
members ticked **Hub admin** on the Board tab (at first: Fiona and Will for
UCLA, Rana for Berkeley). Emails come from `BOARD_INVITE_FROM` with reply-to
set to the chapter's organizer, so they need `BREVO_API_KEY` and
`BOARD_INVITE_FROM` (its domain verified in Brevo, as for invites).

## Calendar invites

Admins schedule meetings on the Meetings tab ("Schedule a meeting"). Each
person invited gets an email with a calendar invite (invite.ics); Gmail,
Apple Mail and Outlook show Yes / Maybe / No, and the reply goes to the
chapter's organizer (Fiona for UCLA, Rana for Berkeley, set in
`lib/board/chapter-server.ts`). Editing a meeting updates the event already
on people's calendars; cancelling a date or the whole meeting removes it.

These go through Brevo's SMTP relay rather than the Brevo API, because only
SMTP can mark the invite as a calendar request. It needs three Railway
variables:

- `BREVO_SMTP_LOGIN` and `BREVO_SMTP_KEY`: in Brevo, **SMTP & API → SMTP**
  (the login shown there, and an SMTP key you generate).
- `BOARD_INVITE_FROM`: the address invites come from, e.g.
  `board@getvindicated.org`. Its domain, **getvindicated.org**, must be
  verified in Brevo (**Senders, Domains & Dedicated IPs → Domains**, then add
  the DNS records Brevo shows).

Use "Send me a test invite" in the form to check one before sending to the
board.

## One-time setup in Railway

1. **Database.** In the Railway project, add a **Postgres** service. In the
   website service's **Variables**, add `DATABASE_URL` and set it to the
   Postgres service's `DATABASE_URL` (Railway offers it as a reference).
2. **Passwords and secret.** In the same Variables screen, add:
   - `BOARD_PASSWORD`, `BOARD_SOCIALS_PASSWORD`, `BOARD_ADMIN_PASSWORD`
   - `BOARD_UCLA_PASSWORD`, `BOARD_UCLA_ADMIN_PASSWORD`
   - `BOARD_SESSION_SECRET`: a random string of at least 32 characters.
     `openssl rand -base64 32` makes one.
3. Redeploy, open `https://www.getvindicated.org/board`, and sign in with
   the admin password. The board makes its own tables and fills in the
   starting assignments, socials, announcements and meetings the first time
   it loads.
4. **Members.** On each hub, sign in with the admin password, open the
   **Board** tab and choose the member file: `board-members.local.json`
   for Berkeley, `board-members-ucla.local.json` for UCLA. They have
   contact details, so they are never committed.

Until the secret and at least one password are set, the page shows the
password box and nothing gets through.

## Running it locally

Put this in `.env.local`:

```
DATABASE_URL=postgres://localhost:5432/board
BOARD_PASSWORD=member-test
BOARD_SOCIALS_PASSWORD=socials-test
BOARD_ADMIN_PASSWORD=admin-test
BOARD_UCLA_PASSWORD=<pick one>
BOARD_UCLA_ADMIN_PASSWORD=<pick another>
BOARD_SESSION_SECRET=any-random-string-at-least-32-characters-long
```

Then `pnpm dev`, and open
http://localhost:3000/board or http://localhost:3000/board/ucla. Without `BREVO_API_KEY`, `pnpm dev` prints
submission emails to the terminal instead of sending them.
