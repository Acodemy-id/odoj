-- ODOJ Ramadan Tracker — Supabase Schema
-- Run this in Supabase SQL Editor

-- 1. Profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  class_name text not null,
  role text not null default 'student' check (role in ('student', 'admin')),
  created_at timestamptz default now()
);

-- 2. Readings table
create table public.readings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null default current_date,
  start_surah int not null,
  start_ayah int not null,
  end_surah int not null,
  end_ayah int not null,
  total_pages int not null,
  juz_obtained float not null,
  created_at timestamptz default now()
);

-- Index for faster queries
create index idx_readings_user_date on public.readings(user_id, date);
create index idx_readings_date on public.readings(date);

-- 3. Auto-create profile on signup via trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, class_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'class_name', ''),
    'student'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4. Enable RLS
alter table public.profiles enable row level security;
alter table public.readings enable row level security;

-- 5. RLS Policies — Profiles
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Admins can view all profiles" on public.profiles
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- 6. RLS Policies — Readings
create policy "Students can insert own readings" on public.readings
  for insert with check (auth.uid() = user_id);

create policy "Students can view own readings" on public.readings
  for select using (auth.uid() = user_id);

create policy "Admins can view all readings" on public.readings
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- 7. App Settings table (feature flags)
create table public.app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz default now()
);

alter table public.app_settings enable row level security;

-- Everyone can read settings (needed to check if input is enabled)
create policy "Anyone can read settings" on public.app_settings
  for select using (true);

-- Only admins can update settings
create policy "Admins can update settings" on public.app_settings
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Seed initial setting: reading input enabled by default
insert into public.app_settings (key, value)
values ('readings_enabled', 'true')
on conflict (key) do nothing;
