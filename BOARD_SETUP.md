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
