-- ABDOU GSM — Admin authorization + Row Level Security
--
-- WHY THIS MIGRATION EXISTS
-- --------------------------
-- Every write in this app (phones insert/update/delete, settings update,
-- phone-images/site-assets storage upload/remove) happens directly from the
-- browser bundle using the public anon key — there are no Next.js API
-- routes. That means Postgres RLS is the ONLY real enforcement boundary:
-- anyone who calls the Supabase REST/Storage API directly (curl, Postman,
-- devtools, a re-implemented client) bypasses every check in the Next.js
-- app entirely. Fixing the frontend without fixing this would not actually
-- secure anything.
--
-- WHAT THIS MIGRATION DOES
-- --------------------------
-- 1. Creates `public.profiles`, a 1:1 table with `auth.users` holding a
--    single `is_admin` boolean. Every new signup gets a profile row via
--    trigger, defaulting to `is_admin = false` — so authentication alone
--    can never grant admin access, satisfying "no way for a normal user to
--    become an administrator."
-- 2. Adds a small `public.is_admin()` helper (SECURITY DEFINER, so it can
--    read `profiles` safely from within other tables' policies without
--    recursive-RLS problems) used by every write policy below.
-- 3. Enables RLS on `phones` and `settings` (public SELECT stays open —
--    this is a public catalog site — INSERT/UPDATE/DELETE require
--    `is_admin()`).
-- 4. Adds storage.objects policies scoping `phone-images` and
--    `site-assets` uploads/updates/deletes to admins only. SELECT is left
--    public since these buckets back publicly displayed images.
--
-- WHAT THIS MIGRATION DOES NOT DO
-- --------------------------
-- - Does not touch, rename, or drop any existing table or column.
-- - Does not delete or modify any existing row in `phones` or `settings`.
-- - Does not run under `service_role` and does not embed any secret.
--
-- REQUIRED MANUAL STEP AFTER RUNNING THIS
-- --------------------------
-- This migration cannot know which existing Supabase Auth user is your
-- admin. After running it, every existing user (including your own admin
-- account) defaults to `is_admin = false` and will be locked out of
-- /admin until you run, once, in the SQL editor:
--
--   update public.profiles set is_admin = true
--   where id = (select id from auth.users where email = 'YOUR_ADMIN_EMAIL');
--
-- Run this whole file in the Supabase SQL Editor (or via the Supabase CLI:
-- `supabase db push`), then run the statement above with your real admin
-- email.

-- 1. profiles table -----------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- A user may read only their own profile row (needed so the app itself,
-- and the is_admin() helper below, can evaluate "am I admin?" for the
-- currently authenticated user).
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

-- Deliberately no INSERT/UPDATE/DELETE policy for regular users: profile
-- rows are created only by the trigger below (as SECURITY DEFINER, so it
-- runs with elevated privilege regardless of RLS), and `is_admin` must
-- only ever be flipped manually by you by running SQL directly with your
-- own database credentials, never via a client request.

-- 2. Auto-create a (non-admin) profile row for every new signup ---------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, is_admin)
  values (new.id, false)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill: give every EXISTING auth user a profile row too (defaults to
-- is_admin = false — including your own account, until you run the manual
-- step in the header comment above). Safe: only inserts missing rows,
-- never touches an existing profiles row.
insert into public.profiles (id, is_admin)
select id, false from auth.users
on conflict (id) do nothing;

-- 3. is_admin() helper ----------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$;

grant execute on function public.is_admin() to authenticated, anon;

-- 4. phones — public read, admin-only write -------------------------------

alter table public.phones enable row level security;

drop policy if exists "phones_select_public" on public.phones;
create policy "phones_select_public"
  on public.phones
  for select
  to anon, authenticated
  using (true);

drop policy if exists "phones_insert_admin" on public.phones;
create policy "phones_insert_admin"
  on public.phones
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "phones_update_admin" on public.phones;
create policy "phones_update_admin"
  on public.phones
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "phones_delete_admin" on public.phones;
create policy "phones_delete_admin"
  on public.phones
  for delete
  to authenticated
  using (public.is_admin());

-- 5. settings — public read (site name/logo/contact info are shown
--    publicly), admin-only write ------------------------------------------

alter table public.settings enable row level security;

drop policy if exists "settings_select_public" on public.settings;
create policy "settings_select_public"
  on public.settings
  for select
  to anon, authenticated
  using (true);

drop policy if exists "settings_update_admin" on public.settings;
create policy "settings_update_admin"
  on public.settings
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- No public insert/delete policy for settings: the app only ever updates
-- the single existing row (id = 1) and never creates or removes rows.

-- 6. storage — phone-images & site-assets: public read, admin-only write --

drop policy if exists "storage_select_public_assets" on storage.objects;
create policy "storage_select_public_assets"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id in ('phone-images', 'site-assets'));

drop policy if exists "storage_insert_admin_assets" on storage.objects;
create policy "storage_insert_admin_assets"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id in ('phone-images', 'site-assets') and public.is_admin());

drop policy if exists "storage_update_admin_assets" on storage.objects;
create policy "storage_update_admin_assets"
  on storage.objects
  for update
  to authenticated
  using (bucket_id in ('phone-images', 'site-assets') and public.is_admin())
  with check (bucket_id in ('phone-images', 'site-assets') and public.is_admin());

drop policy if exists "storage_delete_admin_assets" on storage.objects;
create policy "storage_delete_admin_assets"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id in ('phone-images', 'site-assets') and public.is_admin());
