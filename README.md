# FastAgenda

Aplicacion React + Vite con API serverless en la carpeta `api/` y base de datos Postgres (Neon).

## Despliegue en Vercel (recomendado)

Este proyecto esta listo para desplegarse desde GitHub sin instalar nada en local.

### 1. Importar repositorio

1. Entra a Vercel y selecciona **Add New > Project**.
2. Conecta tu GitHub y elige el repositorio `fastagenda`.
3. Deja el framework como **Vite** (autodetectado).

### 2. Variables de entorno

Configura estas variables en Vercel (Project Settings > Environment Variables):

- `DATABASE_URL`: URL de conexion de Neon/Postgres.
- `VITE_GOOGLE_CLIENT_ID`: Client ID de Google OAuth.

Usa las variables al menos en `Production` (y opcionalmente en `Preview`/`Development`).

### 3. Crear tablas en Postgres

Ejecuta este SQL en tu base de datos Neon:

```sql
CREATE TABLE IF NOT EXISTS sessions (
	id TEXT PRIMARY KEY,
	email TEXT,
	name TEXT,
	picture TEXT,
	updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
	id BIGINT PRIMARY KEY,
	session_id TEXT NOT NULL,
	cat TEXT NOT NULL,
	date TEXT NOT NULL,
	time TEXT NOT NULL,
	done BOOLEAN NOT NULL DEFAULT FALSE,
	notes TEXT NOT NULL DEFAULT '',
	reminder TEXT,
	CONSTRAINT fk_tasks_session FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS categories (
	key TEXT NOT NULL,
	session_id TEXT NOT NULL,
	label TEXT NOT NULL,
	color_id TEXT,
	color TEXT,
	light TEXT,
	dot TEXT,
	PRIMARY KEY (key, session_id),
	CONSTRAINT fk_categories_session FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS month_notes (
	month_key TEXT NOT NULL,
	session_id TEXT NOT NULL,
	text TEXT,
	checklist JSONB,
	PRIMARY KEY (month_key, session_id),
	CONSTRAINT fk_notes_session FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);
```

### 4. Configurar Google OAuth

En Google Cloud Console:

1. Crea un **OAuth 2.0 Client ID** (Web application).
2. En **Authorized JavaScript origins** agrega:
	 - `https://TU-PROYECTO.vercel.app`
	 - `http://localhost:5173` (para desarrollo local)
3. Copia el Client ID y cargalo en `VITE_GOOGLE_CLIENT_ID` en Vercel.

### 5. Desplegar

1. Haz click en **Deploy** en Vercel.
2. Cuando termine, abre la URL publica.
3. Verifica:
	 - Login con Google.
	 - Creacion/lectura de tareas.
	 - Persistencia de datos en Postgres.

## Desarrollo local

Si tienes Node.js instalado:

```bash
npm install
npm run dev
```

## Notas tecnicas

- Frontend: `src/`
- API serverless: `api/`
- Build command: `npm run build`
- Output dir: `dist`
