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
                  CHECK (status IN ('pending', 'submitted', 'done', 'missing')),
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
  kind      text NOT NULL DEFAULT 'b' CHECK (kind IN ('b', 'x', 'o', 'org')),
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
