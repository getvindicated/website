# Setting up /board

`/board` is the UC Berkeley chapter's board hub. It isn't linked from the
site and tells search engines not to index it. To see anything, people
need a password.

## Passwords

| Railway variable         | Who gets it          | What it unlocks                         |
| ------------------------ | -------------------- | --------------------------------------- |
| `BOARD_PASSWORD`         | everyone on the board | view everything, submit assignments     |
| `BOARD_SOCIALS_PASSWORD` | Pierce               | also add, edit and delete socials       |
| `BOARD_ADMIN_PASSWORD`   | Rana                 | edit everything                         |

Use three different passwords. People stay signed in on a device for 30
days. To remove someone's access, change the password they used; that
signs out everyone who used it, and you share the new one with the rest.

Ten wrong tries from the same connection lock the form for 15 minutes.

## One-time setup in Railway

1. **Database.** In the Railway project, add a **Postgres** service. In the
   website service's **Variables**, add `DATABASE_URL` and set it to the
   Postgres service's `DATABASE_URL` (Railway offers it as a reference).
2. **Passwords and secret.** In the same Variables screen, add:
   - `BOARD_PASSWORD`, `BOARD_SOCIALS_PASSWORD`, `BOARD_ADMIN_PASSWORD`
   - `BOARD_SESSION_SECRET`: a random string of at least 32 characters.
     `openssl rand -base64 32` makes one.
3. **Tables and starting data.** From a checkout of the repo with the real
   member list saved as `scripts/board-members.local.json` (it has phone
   numbers, so it is never committed):

   ```
   railway run pnpm board:migrate
   railway run pnpm board:seed
   ```

4. Redeploy, open `https://www.getvindicated.org/board`, and sign in.

Until the secret and at least one password are set, the page shows the
password box and nothing gets through.

## Running it locally

Put this in `.env.local`:

```
DATABASE_URL=postgres://localhost:5432/board
BOARD_PASSWORD=member-test
BOARD_SOCIALS_PASSWORD=socials-test
BOARD_ADMIN_PASSWORD=admin-test
BOARD_SESSION_SECRET=any-random-string-at-least-32-characters-long
```

Then `pnpm board:migrate && pnpm board:seed && pnpm dev`, and open
http://localhost:3000/board. Without `BREVO_API_KEY`, `pnpm dev` prints
submission emails to the terminal instead of sending them.
