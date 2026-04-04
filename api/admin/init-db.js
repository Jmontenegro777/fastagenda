import { getDb } from "../_db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  // Protección con token secreto
  const token = req.headers["x-admin-token"];
  if (!token || token !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: "No autorizado" });
  }

  const sql = getDb();

  try {
    // Borrar tablas existentes en orden (respetando FK)
    await sql`DROP TABLE IF EXISTS tasks`;
    await sql`DROP TABLE IF EXISTS categories`;
    await sql`DROP TABLE IF EXISTS month_notes`;
    await sql`DROP TABLE IF EXISTS sessions`;

    // Recrear tablas
    await sql`
      CREATE TABLE sessions (
        id TEXT PRIMARY KEY,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE tasks (
        id          BIGINT PRIMARY KEY,
        session_id  TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
        cat         TEXT,
        date        TEXT,
        time        TEXT,
        done        BOOLEAN DEFAULT FALSE,
        notes       TEXT DEFAULT '',
        reminder    TEXT,
        created_at  TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE categories (
        key         TEXT,
        session_id  TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
        label       TEXT,
        color_id    TEXT,
        color       TEXT,
        light       TEXT,
        dot         TEXT,
        PRIMARY KEY (key, session_id)
      )
    `;

    await sql`
      CREATE TABLE month_notes (
        month_key   TEXT,
        session_id  TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
        text        TEXT DEFAULT '',
        checklist   TEXT DEFAULT '[]',
        PRIMARY KEY (month_key, session_id)
      )
    `;

    return res.status(200).json({
      ok: true,
      message: "Base de datos inicializada correctamente",
      tables: ["sessions", "tasks", "categories", "month_notes"],
    });
  } catch (err) {
    console.error("init-db error:", err);
    return res.status(500).json({ error: err.message });
  }
}
