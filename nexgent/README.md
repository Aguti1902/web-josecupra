# NexGent — Demo comercial para clubes de fútbol

Aplicación web funcional (no maqueta estática) para reuniones comerciales con clubes profesionales.

## Arranque rápido

```bash
cd nexgent
cp .env.local.example .env.local
# Edita .env.local con tus claves Supabase y Anthropic (opcional)
npm install
npm run dev
```

- **Landing pitch:** http://localhost:3001/
- **Dashboard demo:** http://localhost:3001/app/inicio
- **Comisiones (interno):** http://localhost:3001/internal/comisiones — no aparece en menús públicos

## Variables de entorno

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Recomendada | URL proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Recomendada | Anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Solo seed | Service role para `npm run seed` |
| `ANTHROPIC_API_KEY` | Opcional | Claude (por defecto). Sin key = respuestas mock |
| `OPENAI_API_KEY` | Opcional | Alternativa si `AI_PROVIDER=openai` |
| `AI_PROVIDER` | Opcional | `anthropic` (default) o `openai` |

Sin Supabase, los módulos REAL usan **localStorage** como fallback para que la demo no falle en directo.

## Seed de Supabase

1. Ejecuta `supabase/schema.sql` en el SQL Editor de Supabase
2. Configura `.env.local`
3. `npm run seed`

## Módulos: qué es REAL vs MAQUETA

| Módulo | Ruta | Estado | Qué funciona en demo | Qué falta para producción |
|--------|------|--------|----------------------|---------------------------|
| **Inicio** | `/app/inicio` | MAQUETA | KPIs, gráfico carga, avatares seed | GPS en vivo, predicción lesión IA |
| **Chat staff** | `/app/chat` | **REAL** | Mensajes persistidos (Supabase/local), resumen IA | Auth, push, adjuntos, permisos por rol |
| **Planificación** | `/app/planificacion` | MAQUETA | Mesociclo/microciclo visual fijo | Editor colaborativo, sync competición |
| **Sesiones** | `/app/sesiones` | **REAL** | IA → JSON → SVG, dibujo manual, banco | Export PDF, biblioteca club, fine-tuning |
| **Carga** | `/app/carga` | **REAL** | Import CSV/XLSX, mapeo columnas, clasificación IA | API Catapult/STATSports, histórico multi-temporada |
| **Vídeo** | `/app/video` | MAQUETA | Eventos timestamp demo | Visión por computador (proyecto aparte) |
| **Scouting** | `/app/scouting` | **REAL** | CRUD informes Supabase/local | IA resumen informes, pipeline ojeadores |
| **Médico** | `/app/medico` | MAQUETA | Estado clínico + barra readaptación | Integración EMR, historial clínico real |
| **Cantera** | `/app/cantera` | MAQUETA | Vista juvenil entrada manual | App móvil entrenadores categorías base |
| **Dirección** | `/app/direccion` | MAQUETA | KPIs + resumen ejecutivo | IA sobre datos reales agregados |
| **Comisiones** | `/internal/comisiones` | **REAL** | 6% auto, histórico Supabase/local | CRM, facturación, permisos admin |

## Despliegue en Vercel

1. Importa el repo y establece **Root Directory** = `nexgent`
2. Añade las variables de entorno
3. Deploy

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind
- Supabase (Postgres + Storage)
- Claude via `lib/ai.ts` (abstracción multi-proveedor)
- Recharts · SVG táctico · xlsx

## Criterio de éxito demo

- No romperse en directo (fallbacks mock sin API/Supabase)
- Chat, sesiones IA, import GPS y scouting se sienten vivos
- Historia coherente desde landing → dashboard en un clic
