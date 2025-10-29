-- Profiles table to store user information and roles
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text,
  email text unique,
  role text check (role in ('student', 'instructor')),
  created_at timestamp default now()
);

-- Modules table to store instructor uploads
create table if not exists modules (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid references profiles(id),
  title text not null,
  description text,
  created_at timestamp default now()
);

-- Module contents table to store AI-generated per-level materials
create table if not exists module_contents (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references modules(id),
  level text check (level in ('easy','medium','high')),
  content text not null,
  created_at timestamp default now()
);

-- Items table to store questions (MCQ + short answer)
create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references modules(id),
  level text check (level in ('easy','medium','high')),
  type text check (type in ('pretest','practice','posttest')),
  question_type text check (question_type in ('mcq','short')),
  question text not null,
  options jsonb,
  answer text,
  explanation text,
  created_at timestamp default now()
);

-- Attempts table to store student responses and feedback
create table if not exists attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  item_id uuid references items(id),
  selected_answer text,
  ai_feedback text,
  is_correct boolean,
  created_at timestamp default now()
);

-- Placements table to store student level tracking
create table if not exists placements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  module_id uuid references modules(id),
  level text check (level in ('easy','medium','high')),
  score numeric,
  updated_at timestamp default now()
);

-- Enable RLS for security
alter table profiles enable row level security;
alter table modules enable row level security;
alter table module_contents enable row level security;
alter table items enable row level security;
alter table attempts enable row level security;
alter table placements enable row level security;

-- Create policies for profiles table
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- Create policies for modules table
create policy "Instructors can view all modules" on modules
  for select using (
    (select role from profiles where id = auth.uid()) = 'instructor' 
    or 
    auth.uid() = instructor_id
  );

create policy "Instructors can insert modules" on modules
  for insert with check (
    (select role from profiles where id = auth.uid()) = 'instructor'
  );

create policy "Instructors can update own modules" on modules
  for update using (
    (select role from profiles where id = auth.uid()) = 'instructor'
    and auth.uid() = instructor_id
  );

create policy "Instructors can delete own modules" on modules
  for delete using (
    (select role from profiles where id = auth.uid()) = 'instructor'
    and auth.uid() = instructor_id
  );

-- Create policies for module_contents table
create policy "All can view module contents" on module_contents
  for select using (true);

create policy "Instructors can manage module contents" on module_contents
  for all using (
    (select role from profiles where id = auth.uid()) = 'instructor'
  );

-- Create policies for items table
create policy "All can view items" on items
  for select using (true);

create policy "Instructors can manage items" on items
  for all using (
    (select role from profiles where id = auth.uid()) = 'instructor'
  );

-- Create policies for attempts table
create policy "Users can view own attempts" on attempts
  for select using (auth.uid() = user_id);

create policy "Users can insert own attempts" on attempts
  for insert with check (auth.uid() = user_id);

-- Create policies for placements table
create policy "Users can view own placements" on placements
  for select using (auth.uid() = user_id);

create policy "Users can insert own placements" on placements
  for insert with check (auth.uid() = user_id);

create policy "Instructors can view all placements" on placements
  for select using (
    (select role from profiles where id = auth.uid()) = 'instructor'
  );