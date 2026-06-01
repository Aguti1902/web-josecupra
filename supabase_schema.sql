-- ============================================================
-- DEPRO Platform — Supabase Schema
-- Ejecuta este SQL en Supabase > SQL Editor > New query
-- ============================================================

-- Extensiones
create extension if not exists "uuid-ossp";

-- ============================================================
-- CLUBS
-- ============================================================
create table clubs (
  id            text primary key,
  name          text not null,
  abbreviation  text,
  city          text,
  country       text default 'España',
  founded       int,
  status        text default 'activo',
  plan          text default 'Personalizado',
  login_code    text,
  coordinator   jsonb,
  created_at    timestamptz default now()
);

-- ============================================================
-- CLUBS_DETAIL (identidad visual, equipos, planes, usuarios por club)
-- Tabla JSONB para almacenar el detalle completo de cada club
-- sin restricciones de schema rígido
-- ============================================================
create table if not exists clubs_detail (
  club_id     text primary key,
  data        jsonb not null default '{}',
  updated_at  timestamptz default now()
);

-- Acceso libre para service role (sin RLS)
alter table clubs_detail disable row level security;

-- Permitir que usuarios autenticados lean los datos de su club
-- (necesario para la sincronización cross-device del coordinador)
grant select on clubs_detail to authenticated;
grant select on clubs to authenticated;

-- ============================================================
-- TEAMS (equipos dentro de un club)
-- ============================================================
create table teams (
  id          uuid primary key default uuid_generate_v4(),
  club_id     uuid references clubs(id) on delete cascade,
  name        text not null,
  category    text,
  season      text,
  created_at  timestamptz default now()
);

-- ============================================================
-- PROFILES (extiende auth.users de Supabase)
-- ============================================================
create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  name          text,
  avatar        text,
  role          text default 'player' check (role in ('admin','player','club')),
  team_role     text check (team_role in ('coordinador','entrenador','ayudante','jugador')),
  plan          text,
  -- Jugador
  position      text,
  level         text,
  training_days int,
  objective     text,
  age           int,
  -- Club (club_id es text para coincidir con clubs.id que usa formato "club{timestamp}")
  club_id       text references clubs(id),
  team_id       uuid references teams(id),
  created_at    timestamptz default now()
);

-- Trigger: crear perfil automáticamente al registrarse
-- También copia club_id y team_role desde user_metadata para usuarios de club
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, role, club_id, team_id, team_role)
  values (
    new.id,
    new.raw_user_meta_data->>'name',
    coalesce(new.raw_user_meta_data->>'role','player'),
    -- club_id: extraer solo si existe y NO es uuid (clubs usan text IDs como "club1234567890")
    case when new.raw_user_meta_data->>'clubId' is not null
         then new.raw_user_meta_data->>'clubId'
         else null end,
    -- team_id: solo si es un uuid válido
    case when (new.raw_user_meta_data->>'teamId') ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
         then (new.raw_user_meta_data->>'teamId')::uuid
         else null end,
    new.raw_user_meta_data->>'teamRole'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- SQUAD (plantilla de jugadores de un equipo)
-- ============================================================
create table squad_players (
  id          uuid primary key default uuid_generate_v4(),
  team_id     uuid references teams(id) on delete cascade,
  club_id     uuid references clubs(id) on delete cascade,
  number      int,
  name        text not null,
  position    text,
  age         int,
  weight      numeric(5,1),
  notes       text,
  created_at  timestamptz default now()
);

-- ============================================================
-- MEDIA LIBRARY (vídeos y PDFs globales)
-- ============================================================
create table media (
  id            uuid primary key default uuid_generate_v4(),
  type          text not null check (type in ('video','pdf')),
  title         text not null,
  tags          text[],
  duration      text,   -- para vídeos
  pages         int,    -- para pdfs
  size_mb       numeric(8,2),
  storage_path  text,   -- ruta en Supabase Storage
  url           text,   -- URL pública
  uploaded_by   uuid references profiles(id),
  created_at    timestamptz default now()
);

-- Asignación de medios a clubs
create table media_club (
  media_id  uuid references media(id) on delete cascade,
  club_id   uuid references clubs(id) on delete cascade,
  primary key (media_id, club_id)
);

-- ============================================================
-- PLAN BLOCKS (bloques del motor IA de jugadores)
-- ============================================================
create table plan_blocks (
  id                  uuid primary key default uuid_generate_v4(),
  name                text not null,
  category            text check (category in ('físico','técnica','táctica','prevención')),
  target_positions    text[],
  target_levels       text[],
  target_frequency    int[],
  target_goals        text[],
  active              boolean default true,
  priority            int default 99,
  created_at          timestamptz default now()
);

-- Ejercicios dentro de un bloque
create table plan_block_exercises (
  id          uuid primary key default uuid_generate_v4(),
  block_id    uuid references plan_blocks(id) on delete cascade,
  name        text not null,
  sets        int,
  reps        text,
  rest        text,
  sort_order  int default 0
);

-- Vídeos vinculados a un bloque
create table plan_block_media (
  block_id  uuid references plan_blocks(id) on delete cascade,
  media_id  uuid references media(id) on delete cascade,
  primary key (block_id, media_id)
);

-- ============================================================
-- PLAYER PLANS (planes generados para cada jugador)
-- ============================================================
create table player_plans (
  id          uuid primary key default uuid_generate_v4(),
  player_id   uuid references profiles(id) on delete cascade,
  month       text,   -- '2025-05'
  status      text default 'activo' check (status in ('activo','completado','borrador')),
  created_at  timestamptz default now()
);

create table player_plan_sessions (
  id          uuid primary key default uuid_generate_v4(),
  plan_id     uuid references player_plans(id) on delete cascade,
  day_label   text,   -- 'Lunes', 'Miércoles'...
  title       text,
  block_id    uuid references plan_blocks(id),
  completion  int default 0 check (completion between 0 and 100),
  sort_order  int default 0
);

-- ============================================================
-- CLUB MICROCYCLES (planes manuales creados por el admin para clubs)
-- ============================================================
create table club_microcycles (
  id          uuid primary key default uuid_generate_v4(),
  club_id     uuid references clubs(id) on delete cascade,
  team_id     uuid references teams(id),
  code        text not null,   -- 'S.1', 'S.2'...
  label       text,
  date_range  text,
  objective   text,
  focus       text,
  status      text default 'borrador' check (status in ('borrador','activo','completado')),
  created_at  timestamptz default now()
);

create table club_sessions (
  id          uuid primary key default uuid_generate_v4(),
  microcycle_id uuid references club_microcycles(id) on delete cascade,
  day         text,
  title       text not null,
  duration    text,
  intensity   text,
  space       text,
  players_num int,
  objective   text,
  completion  int default 0 check (completion between 0 and 100),
  sort_order  int default 0
);

create table club_session_exercises (
  id          uuid primary key default uuid_generate_v4(),
  session_id  uuid references club_sessions(id) on delete cascade,
  name        text not null,
  sets        int,
  reps        text,
  rest        text,
  sort_order  int default 0
);

create table club_session_media (
  session_id  uuid references club_sessions(id) on delete cascade,
  media_id    uuid references media(id) on delete cascade,
  primary key (session_id, media_id)
);

-- ============================================================
-- RANKING (puntos diarios de jugadores)
-- ============================================================
create table ranking_entries (
  id          uuid primary key default uuid_generate_v4(),
  player_id   uuid references profiles(id) on delete cascade,
  date        date default current_date,
  points      int default 0,
  sessions_done int default 0,
  streak      int default 0
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Habilitar RLS en todas las tablas
alter table profiles           enable row level security;
alter table clubs              enable row level security;
alter table teams              enable row level security;
alter table squad_players      enable row level security;
alter table media              enable row level security;
alter table media_club         enable row level security;
alter table plan_blocks        enable row level security;
alter table plan_block_exercises enable row level security;
alter table plan_block_media   enable row level security;
alter table player_plans       enable row level security;
alter table player_plan_sessions enable row level security;
alter table club_microcycles   enable row level security;
alter table club_sessions      enable row level security;
alter table club_session_exercises enable row level security;
alter table club_session_media enable row level security;
alter table ranking_entries    enable row level security;

-- PROFILES: cada usuario lee/edita su propio perfil
create policy "profiles_own" on profiles
  for all using (auth.uid() = id);

-- Admin lee todos los perfiles
create policy "profiles_admin_read" on profiles
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- CLUBS: admin gestiona todo, club users leen su club
create policy "clubs_admin_all" on clubs
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "clubs_member_read" on clubs
  for select using (
    exists (select 1 from profiles where id = auth.uid() and club_id = clubs.id)
  );

-- TEAMS: admin gestiona todo, miembros del club leen
create policy "teams_admin_all" on teams
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "teams_member_read" on teams
  for select using (
    exists (
      select 1 from profiles p
      join clubs c on c.id = p.club_id
      where p.id = auth.uid() and c.id = teams.club_id
    )
  );

-- SQUAD: admin gestiona, coordinador del club lee todo su club, entrenador lee su equipo
create policy "squad_admin_all" on squad_players
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "squad_club_read" on squad_players
  for select using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.role = 'club'
        and p.club_id = squad_players.club_id
        and (p.team_role = 'coordinador' or p.team_id = squad_players.team_id)
    )
  );

-- MEDIA: admin gestiona todo
create policy "media_admin_all" on media
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Club users leen medios asignados a su club
create policy "media_club_read" on media
  for select using (
    exists (
      select 1 from media_club mc
      join profiles p on p.club_id = mc.club_id
      where mc.media_id = media.id and p.id = auth.uid()
    )
  );

-- PLAN BLOCKS: admin gestiona, todos los autenticados pueden leer (para la IA)
create policy "plan_blocks_admin_all" on plan_blocks
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "plan_blocks_read" on plan_blocks
  for select using (auth.uid() is not null);

-- PLAYER PLANS: jugador lee su propio plan, admin lee todo
create policy "player_plans_own" on player_plans
  for select using (auth.uid() = player_id);

create policy "player_plans_admin" on player_plans
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- CLUB MICROCYCLES: admin gestiona, club lee su club (con filtro de equipo)
create policy "microcycles_admin_all" on club_microcycles
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "microcycles_club_read" on club_microcycles
  for select using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.role = 'club'
        and p.club_id = club_microcycles.club_id
        and (p.team_role = 'coordinador' or p.team_id = club_microcycles.team_id)
    )
  );

-- RANKING: jugadores leen todo el ranking, solo modifican el suyo
create policy "ranking_read" on ranking_entries
  for select using (auth.uid() is not null);

create policy "ranking_own_write" on ranking_entries
  for insert with check (auth.uid() = player_id);

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
-- Ejecuta esto también en Storage > New bucket:
-- 1. Bucket "media" — para vídeos y PDFs — privado
-- 2. Bucket "avatars" — para logos de club — público

-- ============================================================
-- DATOS INICIALES (admin por defecto)
-- ============================================================
-- Después de crear el primer usuario en Auth, ejecuta esto
-- sustituyendo el UUID por el de tu usuario admin:
--
-- update profiles
-- set role = 'admin', name = 'Jose (Admin)'
-- where id = 'TU-UUID-AQUI';
