# Cloudflare Access for /board

`/board` lists board members' phone numbers. It must only be reachable
through Cloudflare Access. The app also checks every request itself: it
verifies the `Cf-Access-Jwt-Assertion` header against your team's public
keys and the application's audience tag, and returns 404 if anything is
missing or wrong. So even if someone reaches the Railway URL directly, they
get a 404.

## 1. Make sure the site goes through Cloudflare

In the Cloudflare dashboard for getvindicated.org, open **DNS**. The records
for `getvindicated.org` and `www` must be **Proxied** (orange cloud). Access
only applies to proxied traffic.

## 2. Pick a login method

1. Open **Zero Trust** from the Cloudflare dashboard.
2. Go to **Settings → Authentication → Login methods**.
3. Add **One-time PIN**. Members type their email and get a code; this works
   for both @berkeley.edu and Gmail addresses, with no extra setup.

While you're in Zero Trust settings, note your **team domain**, which looks
like `yourteam.cloudflareaccess.com`. You'll need it in step 5.

## 3. Create the Access application

1. Go to **Access → Applications → Add an application → Self-hosted**.
2. Name: `VINdicated Board`.
3. Session duration: `24 hours` (or what you prefer).
4. Add these destinations (public hostnames). Use **Add domain** for each:

   | Subdomain | Domain             | Path        |
   | --------- | ------------------ | ----------- |
   | (empty)   | getvindicated.org  | `board`     |
   | (empty)   | getvindicated.org  | `api/board` |
   | `www`     | getvindicated.org  | `board`     |
   | `www`     | getvindicated.org  | `api/board` |

   A path also covers everything under it, so `api/board` protects
   `/api/board/submit`, `/api/board/socials/12`, and so on.

5. Leave the rest as is and continue to **Policies**.

## 4. Add the allowlist policy

1. **Add a policy**. Name: `Berkeley board`. Action: **Allow**.
2. Under **Include**, choose **Emails** and add every board member's email,
   one per entry. Start with:
   - `ranadarwich05@gmail.com` (admin)
   - `pierce.kosobayashi@berkeley.edu` (edits socials)
   - every other board member's email from the Board tab.
3. Save the policy, then save the application.

To add or remove someone later, edit this policy. Who can edit what inside
the page is set in `lib/board/roles.ts`, not in Cloudflare.

## 5. Give the app the two values it checks

1. Open the application you just created. Copy its **Application Audience
   (AUD) Tag** (on the application's overview or basic information page).
2. In Railway, open the website service → **Variables**, and add:
   - `CF_ACCESS_TEAM_DOMAIN` = your team domain, e.g. `yourteam.cloudflareaccess.com`
     (no `https://`)
   - `CF_ACCESS_AUD` = the AUD tag
3. Make sure `BOARD_DEV_EMAIL` is **not** set in Railway. (It's ignored in
   production anyway.)
4. Redeploy.

The AUD tag only changes if you delete and recreate the application. If you
ever do, update `CF_ACCESS_AUD`.

## 6. Check it

- In a private window, open `https://getvindicated.org/board`. You should get
  the Cloudflare login page, not the board.
- Sign in with an allowed email. You should see the board, with
  "Signed in as …" under the title.
- From a terminal, `curl -i https://getvindicated.org/api/board/socials -X POST`
  should be stopped by Cloudflare (a redirect to the login page or a 403),
  never a 201.
- Open your Railway URL directly (`https://<service>.up.railway.app/board`).
  You should get a 404.

## Local development

You don't need Cloudflare locally. Put this in `.env.local`:

```
DATABASE_URL=postgres://localhost:5432/board
BOARD_DEV_EMAIL=ranadarwich05@gmail.com
```

`BOARD_DEV_EMAIL` only works under `pnpm dev`. To try another account,
set a `board-dev-as` cookie in the browser console, then reload:

```js
document.cookie = "board-dev-as=pierce.kosobayashi@berkeley.edu; path=/";
```

Delete the cookie to go back to `BOARD_DEV_EMAIL`.
