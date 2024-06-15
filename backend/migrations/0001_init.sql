-- Initial schema for Granblue Automation Statistics on a self-hosted Postgres.
--
-- Tables: users (accounts and password hashes), results (one row per run), items (the catalog plus a
-- running total), password_resets (one-time recovery tokens), api_auth_audit, and session (login
-- sessions, in the layout connect-pg-simple expects).
--
-- The API applies this on startup. See SELF_HOSTING.md.

-- users: one row per account. The password is a bcrypt hash.
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  email text not null,
  password_hash text not null,
  is_admin boolean not null default false,
  -- Bumped on every password change. Bearer tokens issued before it are rejected.
  password_changed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  -- No "@" and no whitespace. The forgot-password form takes a username or an email in one box, so a
  -- username must never look like an address.
  constraint users_username_format check (username ~ '^[^@[:space:]]{1,64}$')
);

-- Usernames and emails are unique case-insensitively, so "Steve" and "steve" cannot both exist.
create unique index if not exists users_username_lower_idx on users (lower(username));
create unique index if not exists users_email_lower_idx on users (lower(email));

-- results: one row per run submitted by a bot.
create table if not exists results (
  id bigint generated always as identity primary key,
  user_id uuid not null references users (id) on delete cascade,
  -- Copy of users.username, so the table rows and the "only my results" filter do not need a join.
  username text not null,
  item_name text not null,
  farming_mode text not null,
  mission text not null,
  amount integer not null default 1 check (amount >= 0),
  platform text not null check (platform in ('GA', 'GAA')),
  date timestamptz not null default now(),
  -- Display-only "HH:MM:SS". No format check on purpose: the bots send a few different shapes and a
  -- failed insert would lose the submission. The API normalizes it instead.
  elapsed_time text not null default '00:00:00',
  created_at timestamptz not null default now()
);

-- Ordering is always (date desc, id desc).
create index if not exists results_date_idx on results (date desc, id desc);
create index if not exists results_item_name_date_idx on results (item_name, date desc);
create index if not exists results_farming_mode_date_idx on results (farming_mode, date desc);
create index if not exists results_mission_date_idx on results (mission, date desc);
create index if not exists results_user_id_idx on results (user_id);

-- items: the catalog the bots read, plus a running total kept up to date by the trigger below.
create table if not exists items (
  id bigint generated always as identity primary key,
  item_name text not null,
  farming_mode text not null,
  mission text not null,
  total_amount bigint not null default 0,
  created_at timestamptz not null default now(),
  constraint items_identity_key unique (farming_mode, mission, item_name)
);

-- password_resets: one-time recovery tokens. Only a sha256 hash of the token is stored.
create table if not exists password_resets (
  token_hash text primary key,
  user_id uuid not null references users (id) on delete cascade,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists password_resets_user_id_idx on password_resets (user_id);

-- api_auth_audit: records how each bot request authenticated, so we can look at real traffic before
-- turning enforcement on. Aggregated per day to keep it small. No IP addresses.
create table if not exists api_auth_audit (
  day date not null,
  route text not null,
  method text not null,
  platform text not null default '',
  app_version text not null default '',
  auth_source text not null,
  request_count bigint not null default 0,
  sample_usernames text[] not null default '{}',
  primary key (day, route, method, platform, app_version, auth_source)
);

-- session: login sessions for express-session. The layout is the one connect-pg-simple expects.
create table if not exists session (
  sid varchar not null primary key,
  sess json not null,
  expire timestamp(6) not null
);

create index if not exists session_expire_idx on session (expire);
-- Lets a password reset or an account deletion find every session for one account without a full scan.
create index if not exists session_user_id_idx on session ((sess ->> 'userId'));

-- Keeps items.total_amount up to date. Doing it in one place means the increment and the decrement
-- cannot get out of step. The insert-on-conflict also creates the catalog row if it is missing.
create or replace function apply_item_total()
returns trigger
language plpgsql
as $$
begin
  if tg_op in ('INSERT', 'UPDATE') then
    insert into items (farming_mode, mission, item_name, total_amount)
    values (new.farming_mode, new.mission, new.item_name, new.amount)
    on conflict on constraint items_identity_key
      do update set total_amount = items.total_amount + excluded.total_amount;
  end if;

  if tg_op in ('UPDATE', 'DELETE') then
    update items
      set total_amount = total_amount - old.amount
      where farming_mode = old.farming_mode
        and mission = old.mission
        and item_name = old.item_name;
  end if;

  return null;
end;
$$;

drop trigger if exists results_apply_item_total on results;
create trigger results_apply_item_total
  after insert or update or delete on results
  for each row execute function apply_item_total();

-- Recomputes every item total from the results table and creates any missing catalog row. The
-- trigger should make this unnecessary, but it is here if a total ever needs fixing. Safe to run at
-- any time: select refresh_item_totals();
create or replace function refresh_item_totals()
returns void
language plpgsql
as $$
begin
  insert into items (farming_mode, mission, item_name, total_amount)
  select r.farming_mode, r.mission, r.item_name, sum(r.amount)
  from results r
  group by 1, 2, 3
  on conflict on constraint items_identity_key do update set total_amount = excluded.total_amount;

  update items i
  set total_amount = 0
  where i.total_amount <> 0
    and not exists (
      select 1 from results r
      where r.farming_mode = i.farming_mode and r.mission = i.mission and r.item_name = i.item_name
    );
end;
$$;
