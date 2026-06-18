-- NexGent demo schema
-- DEMO: ejecutar en Supabase SQL Editor + npm run seed
-- PRODUCCIÓN: añadir club_id, RLS, auth.users FK, índices compuestos

create extension if not exists "uuid-ossp";

create table if not exists chat_messages (
  id uuid primary key default uuid_generate_v4(),
  channel_id text not null,
  author text not null,
  role text not null default '',
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists scouting_reports (
  id uuid primary key default uuid_generate_v4(),
  player_name text not null,
  physical int not null check (physical between 1 and 10),
  technical int not null check (technical between 1 and 10),
  tactical int not null check (tactical between 1 and 10),
  attitudinal int not null check (attitudinal between 1 and 10),
  notes text default '',
  created_at timestamptz not null default now()
);

create table if not exists load_records (
  id uuid primary key default uuid_generate_v4(),
  player_name text not null,
  session_date date not null default current_date,
  metrics jsonb not null default '{}',
  band text not null check (band in ('optima', 'alta', 'riesgo')),
  explanation text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists session_tasks (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text default '',
  diagram jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists commissions (
  id uuid primary key default uuid_generate_v4(),
  commercial text not null default 'Comercial',
  client text not null,
  amount numeric(12,2) not null,
  commission numeric(12,2) not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_chat_channel on chat_messages(channel_id, created_at desc);
create index if not exists idx_load_player on load_records(player_name, session_date desc);

-- DEMO: políticas abiertas (eliminar en producción)
alter table chat_messages enable row level security;
alter table scouting_reports enable row level security;
alter table load_records enable row level security;
alter table session_tasks enable row level security;
alter table commissions enable row level security;

create policy "demo_all_chat" on chat_messages for all using (true) with check (true);
create policy "demo_all_scouting" on scouting_reports for all using (true) with check (true);
create policy "demo_all_load" on load_records for all using (true) with check (true);
create policy "demo_all_sessions" on session_tasks for all using (true) with check (true);
create policy "demo_all_commissions" on commissions for all using (true) with check (true);
