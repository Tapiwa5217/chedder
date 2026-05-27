-- ============================================================
-- BookSocial Database Schema
-- Run this in the Supabase SQL Editor (Project → SQL Editor → New query)
-- ============================================================

-- ── Profiles (extends auth.users) ─────────────────────────
create table if not exists public.profiles (
  id       uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  name     text not null,
  bio      text default '',
  avatar   text not null default 'U',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── Books catalog (shared across users) ───────────────────
create table if not exists public.books (
  id          text primary key,
  title       text not null,
  author      text not null,
  cover_url   text,
  description text,
  year        int,
  subjects    text[],
  pages       int
);

-- ── Shelf entries ──────────────────────────────────────────
create table if not exists public.shelf_entries (
  id       uuid default gen_random_uuid() primary key,
  user_id  uuid references public.profiles(id) on delete cascade not null,
  book_id  text references public.books(id) not null,
  shelf    text check (shelf in ('wishlist', 'reading', 'read')) not null,
  added_at timestamptz default now(),
  rating   int  check (rating >= 1 and rating <= 5),
  review   text,
  progress int  check (progress >= 0 and progress <= 100),
  unique(user_id, book_id)
);

-- ── Follows ────────────────────────────────────────────────
create table if not exists public.follows (
  follower_id  uuid references public.profiles(id) on delete cascade,
  following_id uuid references public.profiles(id) on delete cascade,
  created_at   timestamptz default now(),
  primary key (follower_id, following_id)
);

-- ── Posts ──────────────────────────────────────────────────
create table if not exists public.posts (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references public.profiles(id) on delete cascade not null,
  type       text check (type in ('review','quote','update','finished','started')) not null,
  content    text not null,
  book_id    text references public.books(id),
  rating     int  check (rating >= 1 and rating <= 5),
  created_at timestamptz default now()
);

-- ── Post likes ─────────────────────────────────────────────
create table if not exists public.post_likes (
  post_id uuid references public.posts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  primary key (post_id, user_id)
);

-- ── Comments ───────────────────────────────────────────────
create table if not exists public.comments (
  id         uuid default gen_random_uuid() primary key,
  post_id    uuid references public.posts(id) on delete cascade not null,
  user_id    uuid references public.profiles(id) on delete cascade not null,
  content    text not null,
  parent_id  uuid references public.comments(id) on delete cascade,
  created_at timestamptz default now()
);

-- ── Comment reactions ───────────────────────────────────────
create table if not exists public.comment_reactions (
  comment_id uuid references public.comments(id) on delete cascade,
  user_id    uuid references public.profiles(id) on delete cascade,
  emoji      text not null default '❤️',
  primary key (comment_id, user_id)
);

-- ── Conversations ──────────────────────────────────────────
create table if not exists public.conversations (
  id            uuid default gen_random_uuid() primary key,
  participant_1 uuid references public.profiles(id) on delete cascade not null,
  participant_2 uuid references public.profiles(id) on delete cascade not null,
  created_at    timestamptz default now(),
  unique(participant_1, participant_2)
);

-- ── Messages ───────────────────────────────────────────────
create table if not exists public.messages (
  id              uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id       uuid references public.profiles(id) on delete cascade not null,
  content         text not null,
  created_at      timestamptz default now(),
  read_at         timestamptz
);

-- ── Book journals ──────────────────────────────────────────
create table if not exists public.book_journals (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references public.profiles(id) on delete cascade not null,
  book_id    text references public.books(id) not null,
  title      text default '',
  content    text not null,
  lessons    text[] default '{}',
  is_public  boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.profiles     enable row level security;
alter table public.books        enable row level security;
alter table public.shelf_entries enable row level security;
alter table public.follows      enable row level security;
alter table public.posts        enable row level security;
alter table public.post_likes   enable row level security;
alter table public.comments     enable row level security;
alter table public.conversations enable row level security;
alter table public.messages     enable row level security;
alter table public.book_journals enable row level security;

-- Drop existing policies so this script is safe to re-run
do $$ declare r record; begin
  for r in select policyname, tablename from pg_policies where schemaname = 'public' loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- Profiles
create policy "Profiles viewable by authenticated users"
  on public.profiles for select to authenticated using (true);
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Books (shared catalog — anyone authenticated can read/insert)
create policy "Books viewable by all"
  on public.books for select using (true);
create policy "Authenticated users can upsert books"
  on public.books for insert to authenticated with check (true);
create policy "Authenticated users can update books"
  on public.books for update to authenticated using (true);

-- Shelf entries (public read so others can see your shelves; write scoped to owner)
create policy "Shelf entries viewable by authenticated"
  on public.shelf_entries for select to authenticated using (true);
create policy "Users manage own shelf"
  on public.shelf_entries for insert using (auth.uid() = user_id);
create policy "Users update own shelf"
  on public.shelf_entries for update using (auth.uid() = user_id);
create policy "Users delete own shelf"
  on public.shelf_entries for delete using (auth.uid() = user_id);

-- Follows
create policy "Follows viewable by authenticated"
  on public.follows for select to authenticated using (true);
create policy "Users manage own follows"
  on public.follows for all using (auth.uid() = follower_id);

-- Posts (public social feed)
create policy "Posts viewable by authenticated"
  on public.posts for select to authenticated using (true);
create policy "Users manage own posts"
  on public.posts for all using (auth.uid() = user_id);

-- Post likes
create policy "Likes viewable by authenticated"
  on public.post_likes for select to authenticated using (true);
create policy "Users manage own likes"
  on public.post_likes for all using (auth.uid() = user_id);

-- Comments
create policy "Comments viewable by authenticated"
  on public.comments for select to authenticated using (true);
create policy "Users manage own comments"
  on public.comments for all using (auth.uid() = user_id);

-- Comment reactions
alter table public.comment_reactions enable row level security;
create policy "Comment reactions viewable by authenticated"
  on public.comment_reactions for select to authenticated using (true);
create policy "Users manage own comment reactions"
  on public.comment_reactions for all using (auth.uid() = user_id);

-- Conversations (visible to participants only)
create policy "Participants view their conversations"
  on public.conversations for select
  using (auth.uid() = participant_1 or auth.uid() = participant_2);
create policy "Authenticated users create conversations"
  on public.conversations for insert to authenticated
  with check (auth.uid() = participant_1 or auth.uid() = participant_2);

-- Messages (visible to conversation participants)
create policy "Participants view messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.participant_1 = auth.uid() or c.participant_2 = auth.uid())
    )
  );
create policy "Authenticated users send messages"
  on public.messages for insert with check (auth.uid() = sender_id);

-- Book journals (own = all; others = public only)
create policy "Users see own journals"
  on public.book_journals for select using (auth.uid() = user_id);
create policy "Public journals visible to authenticated"
  on public.book_journals for select to authenticated using (is_public = true);
create policy "Users manage own journals"
  on public.book_journals for all using (auth.uid() = user_id);

-- ============================================================
-- Auto-create profile on sign-up
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  _name     text;
  _username text;
  _avatar   text;
begin
  _name     := coalesce(
                 new.raw_user_meta_data->>'name',
                 new.raw_user_meta_data->>'full_name',
                 split_part(new.email, '@', 1)
               );
  _username := coalesce(
                 new.raw_user_meta_data->>'username',
                 regexp_replace(lower(split_part(new.email, '@', 1)), '[^a-z0-9]', '', 'g')
               );
  _avatar   := upper(left(_name, 2));

  -- Ensure username is unique by appending random suffix if needed
  if exists (select 1 from public.profiles where username = _username) then
    _username := _username || floor(random() * 9000 + 1000)::text;
  end if;

  insert into public.profiles (id, username, name, bio, avatar)
  values (new.id, _username, _name, '', _avatar);

  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Notifications ──────────────────────────────────────────
create table if not exists public.notifications (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references public.profiles(id) on delete cascade not null,
  actor_id   uuid references public.profiles(id) on delete cascade not null,
  type       text check (type in ('like', 'comment', 'follow')) not null,
  post_id    uuid references public.posts(id) on delete cascade,
  read       boolean default false,
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;

create policy "Users view own notifications"
  on public.notifications for select using (auth.uid() = user_id);
create policy "Authenticated users can insert notifications"
  on public.notifications for insert to authenticated with check (true);
create policy "Users can update own notifications"
  on public.notifications for update using (auth.uid() = user_id);

-- ============================================================
-- OAuth Provider Setup (do this in Supabase Dashboard)
-- ============================================================
-- Authentication → Providers → Enable:
--   Google:   requires GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET
--   GitHub:   requires GITHUB_CLIENT_ID + GITHUB_CLIENT_SECRET
--   Facebook: requires FACEBOOK_CLIENT_ID + FACEBOOK_CLIENT_SECRET
--
-- Redirect URL to whitelist in each provider's dashboard:
--   https://<your-project>.supabase.co/auth/v1/callback
-- ============================================================
