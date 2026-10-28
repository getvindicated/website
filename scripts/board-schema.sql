-- /board database. Safe to run more than once.

CREATE TABLE IF NOT EXISTS board_members (
  id          serial PRIMARY KEY,
  name        text NOT NULL,
  first_name  text NOT NULL,
  role        text NOT NULL DEFAULT '',
  team        text NOT NULL DEFAULT '',
  also_team   text,
  tier        smallint,            -- 0 = president, 1 = executive row, null = team member
  is_lead     boolean NOT NULL DEFAULT false,
  email       text NOT NULL DEFAULT '',
  phone       text NOT NULL DEFAULT '',
  sort        integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS board_assignments (
  id              serial PRIMARY KEY,
  round           smallint NOT NULL,
  person          text NOT NULL,   -- first name, matches board_members.first_name
  person_role     text NOT NULL DEFAULT '',
  task            text NOT NULL,
  proof_required  text NOT NULL DEFAULT '',
  due_date        date,
  status          text NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'submitted', 'done', 'missing', 'excused')),
  status_note     text NOT NULL DEFAULT '',
  sort            integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS board_submissions (
  id               serial PRIMARY KEY,
  person           text NOT NULL,
  assignment_id    integer REFERENCES board_assignments(id) ON DELETE SET NULL,
  task_label       text NOT NULL,
  submitter_email  text NOT NULL,
  body             text NOT NULL DEFAULT '',
  filenames        text[] NOT NULL DEFAULT '{}',
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS board_socials (
  id        serial PRIMARY KEY,
  date      date NOT NULL,
  time      text NOT NULL DEFAULT '',
  title     text NOT NULL,
  location  text NOT NULL DEFAULT '',
  kind      text NOT NULL DEFAULT 'b' CHECK (kind IN ('b', 'o', 'org')),
  lead      text NOT NULL DEFAULT '',
  status    text NOT NULL DEFAULT '',
  cost      text NOT NULL DEFAULT '',
  note      text NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS board_announcements (
  id         serial PRIMARY KEY,
  title      text NOT NULL,
  body       text NOT NULL DEFAULT '',
  posted_on  date NOT NULL DEFAULT current_date,
  link_tab   text NOT NULL DEFAULT '',   -- optional: a /board tab to link to
  link_label text NOT NULL DEFAULT '',
  sort       integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS board_meetings (
  id             serial PRIMARY KEY,
  date           date NOT NULL,
  title          text NOT NULL DEFAULT 'Board meeting',
  summary        text NOT NULL DEFAULT '',
  recording_url  text NOT NULL DEFAULT ''
);

-- One-time data changes already applied to this database (see lib/board/setup.ts).
CREATE TABLE IF NOT EXISTS board_changes (
  name        text PRIMARY KEY,
  applied_at  timestamptz NOT NULL DEFAULT now()
);

-- Chapters: every row belongs to one. Rows from before UCLA joined are
-- Berkeley's.
ALTER TABLE board_members       ADD COLUMN IF NOT EXISTS chapter text NOT NULL DEFAULT 'berkeley';
ALTER TABLE board_assignments   ADD COLUMN IF NOT EXISTS chapter text NOT NULL DEFAULT 'berkeley';
ALTER TABLE board_submissions   ADD COLUMN IF NOT EXISTS chapter text NOT NULL DEFAULT 'berkeley';
ALTER TABLE board_socials       ADD COLUMN IF NOT EXISTS chapter text NOT NULL DEFAULT 'berkeley';
ALTER TABLE board_announcements ADD COLUMN IF NOT EXISTS chapter text NOT NULL DEFAULT 'berkeley';
ALTER TABLE board_meetings      ADD COLUMN IF NOT EXISTS chapter text NOT NULL DEFAULT 'berkeley';

ALTER TABLE board_announcements ADD COLUMN IF NOT EXISTS admins_only boolean NOT NULL DEFAULT false;
ALTER TABLE board_meetings      ADD COLUMN IF NOT EXISTS absent text NOT NULL DEFAULT '';

-- Rounds (Berkeley) or weeks (UCLA) of deliverables. One is current; the
-- rest show in the archive.
CREATE TABLE IF NOT EXISTS board_rounds (
  chapter      text NOT NULL,
  round        smallint NOT NULL,
  due_date     date NOT NULL,
  is_current   boolean NOT NULL DEFAULT false,
  show_status  boolean NOT NULL DEFAULT true,
  note         text NOT NULL DEFAULT '',
  PRIMARY KEY (chapter, round)
);

-- Meetings scheduled with calendar invites. The UID stays the same for the
-- life of the meeting; SEQUENCE goes up with every change sent out.
CREATE TABLE IF NOT EXISTS board_scheduled (
  id               serial PRIMARY KEY,
  chapter          text NOT NULL,
  uid              text NOT NULL UNIQUE,
  sequence         integer NOT NULL DEFAULT 0,
  title            text NOT NULL,
  date             date NOT NULL,
  start_time       text NOT NULL,
  end_time         text NOT NULL,
  location         text NOT NULL DEFAULT '',
  notes            text NOT NULL DEFAULT '',
  weekly           boolean NOT NULL DEFAULT false,
  until            date,
  invitees         jsonb NOT NULL DEFAULT '[]',
  audience         text NOT NULL DEFAULT '',
  cancelled_dates  date[] NOT NULL DEFAULT '{}',
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- Chapter content admins edit on the page (subtitle, meeting time, rule,
-- teams, quick links, key dates, photos, Projects). Seeded from
-- lib/board/chapters.ts.
CREATE TABLE IF NOT EXISTS board_settings (
  id       serial PRIMARY KEY,
  chapter  text NOT NULL,
  key      text NOT NULL,
  value    jsonb NOT NULL,
  UNIQUE (chapter, key)
);

-- Photos uploaded for the Home tab's photo row. Kept in the database
-- because the app's disk is replaced on every deploy.
CREATE TABLE IF NOT EXISTS board_photos (
  id            serial PRIMARY KEY,
  chapter       text NOT NULL,
  content_type  text NOT NULL,
  data          bytea NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Every admin change, with the rows before and after, so it can be undone.
CREATE TABLE IF NOT EXISTS board_changelog (
  id        serial PRIMARY KEY,
  chapter   text NOT NULL,
  at        timestamptz NOT NULL DEFAULT now(),
  role      text NOT NULL,
  actor     text NOT NULL DEFAULT '',   -- name the admin typed in (self-reported)
  action    text NOT NULL,              -- create, update, delete, bulk, restore, note
  summary   text NOT NULL,
  changes   jsonb NOT NULL DEFAULT '[]' -- [{ table, id, before, after }]
);

-- Announcement emails: one row per person per send.
CREATE TABLE IF NOT EXISTS board_announcement_sends (
  id               serial PRIMARY KEY,
  chapter          text NOT NULL,
  announcement_id  integer NOT NULL,
  batch            text NOT NULL,       -- one send (post, update or retry)
  kind             text NOT NULL,       -- post, update, retry
  email            text NOT NULL,
  name             text NOT NULL DEFAULT '',
  ok               boolean NOT NULL,
  error            text NOT NULL DEFAULT '',
  at               timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE board_members ADD COLUMN IF NOT EXISTS is_hub_admin boolean NOT NULL DEFAULT false;
-- Lets rounds be edited and restored like every other row.
ALTER TABLE board_rounds ADD COLUMN IF NOT EXISTS id serial;

-- Who an announcement is for ("Send to"): JSON, see lib/board/audience.ts.
-- Replaces admins_only, which setup turns into {"kind":"hubAdmins"}.
ALTER TABLE board_announcements ADD COLUMN IF NOT EXISTS audience text NOT NULL DEFAULT '{"kind":"everyone"}';
-- What a send was addressed to, as shown on the hub ("Leads only").
ALTER TABLE board_announcement_sends ADD COLUMN IF NOT EXISTS audience text NOT NULL DEFAULT '';

-- How many invites to a scheduled meeting have gone through. 0 means none
-- ever did (e.g. saved while sending was broken): the Meetings tab offers
-- "Resend invites".
ALTER TABLE board_scheduled ADD COLUMN IF NOT EXISTS invites_sent integer NOT NULL DEFAULT 0;

-- Public events (the /events page, see lib/events). Times are Pacific
-- wall-clock. meeting_link is private: it only goes out in RSVP
-- confirmation and reminder emails, never on the page or in a public API.
-- flyer_id points at board_photos.
CREATE TABLE IF NOT EXISTS board_events (
  id            serial PRIMARY KEY,
  chapter       text NOT NULL,
  uid           text NOT NULL UNIQUE,
  title         text NOT NULL,
  tag           text NOT NULL DEFAULT '',
  date          date NOT NULL,
  start_time    text NOT NULL,
  end_time      text NOT NULL,
  online        boolean NOT NULL DEFAULT true,
  meeting_link  text NOT NULL DEFAULT '',
  address       text NOT NULL DEFAULT '',
  host_name     text NOT NULL DEFAULT '',
  host_title    text NOT NULL DEFAULT '',
  description   text NOT NULL DEFAULT '',
  flyer_id      integer,
  show_count    boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- RSVPs from the public page: one per email per event. No foreign key, so
-- restoring a deleted event from the change log brings its RSVPs back too.
CREATE TABLE IF NOT EXISTS board_event_rsvps (
  id          serial PRIMARY KEY,
  chapter     text NOT NULL,
  event_id    integer NOT NULL,
  name        text NOT NULL,
  email       text NOT NULL,
  school      text NOT NULL DEFAULT '',
  question    text NOT NULL DEFAULT '',
  opt_in      boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS board_event_rsvps_once ON board_event_rsvps (event_id, lower(email));

-- Events in other languages: {"es": {"title": …, "tag": …, "hostTitle": …,
-- "description": …}, …}. Missing fields show the English.
ALTER TABLE board_events ADD COLUMN IF NOT EXISTS translations jsonb NOT NULL DEFAULT '{}';
-- The language the visitor RSVPed in; their emails go out in it.
ALTER TABLE board_event_rsvps ADD COLUMN IF NOT EXISTS locale text NOT NULL DEFAULT 'en';
