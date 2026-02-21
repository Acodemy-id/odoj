-- Migration: Add user_awards table for Wall of Fame
-- Run this in Supabase SQL Editor

-- 1. User Awards table
create table public.user_awards (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  award_type text not null, -- e.g., 'khatam', 'streak', 'early_bird', 'sahur'
  award_value int not null default 1, -- e.g., 1x, 2x for khatam; 3, 7 for streak
  metadata jsonb default '{}'::jsonb,
  achieved_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Index for faster queries
create index idx_user_awards_user on public.user_awards(user_id);
create index idx_user_awards_type on public.user_awards(award_type);

-- 2. Enable RLS
alter table public.user_awards enable row level security;

-- 3. RLS Policies
create policy "Anyone can view all awards" on public.user_awards
  for select using (true);

create policy "System/Admins can manage awards" on public.user_awards
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Note: In a production environment with Edge Functions, 
-- you might want a service_role key to bypass RLS for awarding logic.
-- For standard Server Actions, we'll rely on Admin check or security definer functions if needed.
