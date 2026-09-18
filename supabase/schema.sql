-- VinnoVerse schema (optional). The app runs with local demo data if this is not applied.

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  reg_no text unique not null,
  hostel text,
  room text,
  role text check (role in ('student', 'warden', 'admin')) not null default 'student'
);

create table if not exists service_requests (
  id uuid primary key default gen_random_uuid(),
  student_id text not null,
  category text not null,
  description text not null,
  location text not null,
  status text check (status in ('Submitted', 'Accepted', 'In Progress', 'Completed')) not null default 'Submitted',
  image_url text,
  timeline jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists mess_menu (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  meal text check (meal in ('Breakfast', 'Lunch', 'Snacks', 'Dinner')) not null,
  items text[] not null
);

create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  latitude double precision not null,
  longitude double precision not null,
  description text
);

create table if not exists timetable (
  id uuid primary key default gen_random_uuid(),
  student_id text not null,
  day text not null,
  start_time text not null,
  end_time text not null,
  subject text not null,
  room text not null,
  faculty text not null
);

create table if not exists exams (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  date date not null,
  start_time text not null,
  end_time text not null,
  venue text not null
);

create table if not exists quizzes (
  id uuid primary key default gen_random_uuid(),
  student_id text not null,
  subject text not null,
  title text not null,
  date_time timestamptz not null
);

alter table service_requests replica identity full;

-- Enable realtime in the dashboard for public.service_requests
