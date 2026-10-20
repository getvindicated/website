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
| `BOARD_UCLA_EVENTS_PASSWORD` | the events editor      | also add, edit and delete events      |
| `BOARD_UCLA_ADMIN_PASSWORD` | Fiona and Will          | edit everything on the UCLA hub       |

The events password sees what members see and can change events (dates,
times, locations, leads, status), nothing else. Its edits go in the change
log as "UCLA events editor".

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

## Who board emails come from

Announcements, calendar invites and submission emails come from the
chapter's sender, set as `from` in `lib/board/chapter-server.ts`:

- Berkeley: Rana <president@getvindicated.org>
- UCLA: President Fiona <vindicatedbruins@getvindicated.org>

Each must be a verified sender in Brevo. A chapter without one (`from: null`)
uses `BOARD_INVITE_FROM` instead. Replies still go to the organizer (or, for
submissions, to the person who submitted).

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

Each announcement has a **Send to**: Everyone (the default), Leads only
(everyone marked Lead plus the top two rows of the chart), Hub admins
(members ticked **Hub admin** on the Board tab), one or more teams, or
picked people. The form lists who that is before anything is sent.

"Email it" (on by default) sends one email per person through the Brevo
API, so no one sees anyone else's address. Emails come from the chapter's
sender (above) with reply-to set to the chapter's organizer. They need
`BREVO_API_KEY`.

On the hub, admins see every announcement. Members see posts for Everyone,
plus posts for a group they're in once they choose their name on My page
(it's remembered in that browser). Hub admins posts only show to admin
sign-ins. Since everyone shares the member password, the name is
self-reported, so don't put anything in a Leads, team or people post that
a member shouldn't see; use Hub admins for that.

## Calendar invites

Admins schedule meetings on the Meetings tab ("Schedule a meeting"). Each
person invited gets a calendar invite: in Gmail, Apple Mail and Outlook it
shows Yes / Maybe / No and adds the event. Replies go to the chapter's organizer (Fiona for UCLA, Rana for Berkeley,
set in `lib/board/chapter-server.ts`). Editing a meeting sends the same
event with a higher sequence number, so calendars update the copy they
have; cancelling a date or the whole meeting sends a cancellation for it.

Invites come from the chapter's sender (above) and go out over Brevo's SMTP
relay on port 2525 (Railway blocks 587 and 465). Only SMTP can mark the
invite as a calendar request, which is what shows the RSVP buttons. Full
calendar invites need two Railway variables:

- `BREVO_SMTP_LOGIN` and `BREVO_SMTP_KEY`: in Brevo, **SMTP & API → SMTP**
  (the login shown there, and an SMTP key you generate).

Without them, or if SMTP fails or times out, invites go through the Brevo
API (`BREVO_API_KEY`) instead. Those still carry the event, but only as an
`invite.ics` attachment to open: no Yes / Maybe / No. The server log says
which way each batch went. `BOARD_INVITE_FROM` is only needed for a
chapter with no sender of its own.

Every email call gives up after 15 seconds. If no invite goes through, the
meeting stays on the Meetings tab marked **Invites not sent**, with
**Resend invites** and **Delete** (deleting it sends nothing).

Use "Send me a test invite" in the form to check one before sending to the
board. Send it to an address other than the organizer's: Gmail doesn't
show RSVP buttons on an invite sent to its own organizer.

## Public events (/events)

Admins add workshops and meetups on each hub's **Events** tab (admins only).
They show on the public Events page, where anyone can RSVP. Each event has:
- a title, tag, date and time (Pacific)
- online or in person, with a meeting link or an address
- a host and a description
- a flyer, uploaded like the hub photos
- an optional "Show RSVP count"

An event belongs to the hub it's made on. Its emails come from that
chapter's sender (above), with reply-to set to the chapter's organizer.

- **RSVPs:** each RSVP gets a confirmation email with the details, the
  meeting link and a calendar file. RSVPing again with the same email
  doesn't add a second RSVP; it just resends the confirmation.
- **The meeting link is private.** It's never on the page or in anything
  the page loads. It only goes out in confirmations and reminders, so add it
  before people RSVP, or send a reminder once it's in.
- **RSVP list:** each event's RSVPs (name, email, school, question, whether
  they want future emails, time) are on the Events tab, with **Copy
  emails**, **Download CSV** and **Send reminder to everyone**. The
  reminder asks first, showing how many people it goes to. Nothing is sent
  on a schedule; reminders only go out when an admin presses the button.
- **Change log:** adding, editing and deleting events goes in the Changes
  tab, like everything else. Sending a reminder is noted there too.

### Launching the page

Until launch the page is private:
- `/events` shows the normal "page not found" to the public, and the RSVP
  form refuses.
- An admin signed in to either hub can open the page to test it (RSVPs
  included), with a "Private preview" banner.
- There's no "Events" link in the header, no next-event strip on the home
  page, no sitemap entry, and the page tells search engines not to index it.

To **launch**, add the Railway variable `EVENTS_PUBLIC` set to exactly
`true` (website service → **Variables**) and deploy. Railway offers to
redeploy when you save a variable; the header and home page only pick up
the change on that new deploy. This adds "Events" to the header (between
Team and Learning Resources) and the next-event strip to the home page.

To **hide it again**, delete `EVENTS_PUBLIC` (or set it to anything but
`true`) and redeploy. Events and RSVPs stay saved on the hub.

## One-time setup in Railway

1. **Database.** In the Railway project, add a **Postgres** service. In the
   website service's **Variables**, add `DATABASE_URL` and set it to the
   Postgres service's `DATABASE_URL` (Railway offers it as a reference).
2. **Passwords and secret.** In the same Variables screen, add:
   - `BOARD_PASSWORD`, `BOARD_SOCIALS_PASSWORD`, `BOARD_ADMIN_PASSWORD`
   - `BOARD_UCLA_PASSWORD`, `BOARD_UCLA_EVENTS_PASSWORD`, `BOARD_UCLA_ADMIN_PASSWORD`
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
