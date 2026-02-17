-- K9 Rehab Pro - Supabase Schema
-- Run this FIRST in Supabase SQL Editor

-- ============================================================
-- EXERCISES
-- ============================================================
create table if not exists exercises (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  name         text not null,
  category     text not null,
  body_region  text not null default 'multi',
  description  text,
  difficulty   text not null default 'Moderate',
  created_at   timestamptz default now()
);

-- ============================================================
-- PROTOCOLS
-- ============================================================
create table if not exists protocols (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  condition   text not null,
  phase       text not null,
  goal        text,
  description text,
  created_at  timestamptz default now()
);

-- ============================================================
-- PROTOCOL EXERCISES (junction table)
-- ============================================================
create table if not exists protocol_exercises (
  id                uuid primary key default gen_random_uuid(),
  protocol_id       uuid references protocols(id) on delete cascade,
  exercise_id       uuid references exercises(id) on delete cascade,
  week_number       int not null default 1,
  sets              int,
  reps              int,
  duration_seconds  int,
  frequency_per_day int,
  notes             text,
  created_at        timestamptz default now()
);

-- ============================================================
-- CLIENTS
-- ============================================================
create table if not exists clients (
  id          uuid primary key default gen_random_uuid(),
  owner_name  text not null,
  dog_name    text not null,
  breed       text,
  age_years   numeric(4,1),
  weight_kg   numeric(6,2),
  condition   text,
  notes       text,
  created_at  timestamptz default now()
);

-- ============================================================
-- CLIENT PROGRAMS
-- ============================================================
create table if not exists client_programs (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid references clients(id) on delete cascade,
  protocol_id uuid references protocols(id),
  start_date  date not null default current_date,
  end_date    date,
  status      text not null default 'active',
  created_at  timestamptz default now()
);

-- ============================================================
-- SESSION LOGS
-- ============================================================
create table if not exists session_logs (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid references clients(id) on delete cascade,
  exercise_id   uuid references exercises(id),
  completed     boolean not null default true,
  pain_score    int check (pain_score between 0 and 10),
  notes         text,
  performed_at  timestamptz not null default now(),
  created_at    timestamptz default now()
);

-- ============================================================
-- CLINICS (multi-tenant)
-- ============================================================
create table if not exists clinics (
  id               uuid primary key default gen_random_uuid(),
  clinic_name      text not null,
  logo_url         text,
  primary_color    text default '#0F4C81',
  secondary_color  text default '#0EA5E9',
  contact_email    text,
  phone            text,
  address          text,
  created_at       timestamptz default now()
);

-- ============================================================
-- CLINIC USERS
-- ============================================================
create table if not exists clinic_users (
  id         uuid primary key default gen_random_uuid(),
  clinic_id  uuid references clinics(id) on delete cascade,
  user_id    uuid references auth.users(id) on delete cascade,
  role       text not null default 'clinician' check (role in ('admin','clinician','assistant')),
  created_at timestamptz default now(),
  unique (clinic_id, user_id)
);
