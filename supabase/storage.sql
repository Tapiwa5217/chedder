-- ============================================================
-- Run this in Supabase SQL Editor after schema.sql
-- Sets up avatar storage + adds avatar_url column to profiles
-- ============================================================

-- Add avatar_url column to profiles (safe to run multiple times)
alter table public.profiles add column if not exists avatar_url text;

-- Add privacy preference columns
alter table public.profiles add column if not exists journal_public_default boolean default false;

-- Create public avatars bucket
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Drop existing storage policies if re-running
drop policy if exists "Avatar images are publicly accessible" on storage.objects;
drop policy if exists "Users can upload own avatar" on storage.objects;
drop policy if exists "Users can update own avatar" on storage.objects;
drop policy if exists "Users can delete own avatar" on storage.objects;

-- Storage RLS policies
create policy "Avatar images are publicly accessible"
  on storage.objects for select using (bucket_id = 'avatars');

create policy "Users can upload own avatar"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can update own avatar"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can delete own avatar"
  on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
