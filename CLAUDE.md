# Deprotrain (José Cupra)

Deprotrain: plataforma web para clubes de fútbol, entrenadores y jugadores (planificación de entrenamientos, cargas, wellness, plantilla, ranking…). Cliente recurrente de Agutidesigns: José Cupra.

## Dónde está publicada
- https://www.deprotrain.com (proyecto de Vercel `web-josecupra-7qlh`)
- https://depro-clubs.vercel.app (proyecto `web-josecupra-ckhq`)
- https://web-josecupra.vercel.app (proyecto `web-josecupra`)
- Los tres proyectos de Vercel se publican desde este mismo repositorio.

## Tecnología
- React + Vite + Tailwind, con i18n (varios idiomas).
- Supabase (usuarios y datos) y Stripe (suscripciones).
- `api/`: funciones de Vercel (pagos, IA).
- `nexgent/`: una app Next.js aparte de NexGent dentro del repo; no forma parte de la web de Deprotrain.

## Estructura
- `src/pages/public/`: web de marketing (inicio, precios, para clubes/entrenadores/jugadores…).
- `src/pages/private/`: la aplicación (dashboard, plantilla, sesiones, cargas…).
- `src/pages/admin/` y `src/components/admin/`: panel de administración.
- `src/i18n/locales/`: traducciones.

## Importante en este proyecto
- Suscripciones con Stripe: no cambies precios, planes ni el webhook sin preguntar.
- Hay 3 proyectos de Vercel conectados a este repo: un cambio se publica en los tres.

## Cómo se publica un cambio
1. Haz el cambio en la rama `main` (o en una rama y luego fusiónala).
2. Antes de subir, comprueba que compila: `npm install` y `npm run build`.
3. Al subir a `main`, Vercel publica solo en 1-2 minutos (los tres proyectos `web-josecupra`). No hace falta tocar nada más.
4. Cuando termines, dile a Alejandro qué has cambiado y en qué URL puede verlo.

## Reglas para trabajar aquí
- Responde siempre en español, claro y sin tecnicismos innecesarios: Alejandro no es programador.
- Las claves (Stripe, Supabase, APIs) viven en las variables de entorno de Vercel. Nunca las escribas en el código ni las subas a GitHub.
- Pregunta antes de: borrar contenido, cambiar precios o pagos, tocar la base de datos, cambiar dominios o variables de Vercel, o enviar algo al cliente.
- Cambios de texto, imágenes, colores o secciones: hazlos directamente.
- Este repositorio es de un cliente de Agutidesigns (Alejandro "Guti"). No mezcles nada de otros clientes.
