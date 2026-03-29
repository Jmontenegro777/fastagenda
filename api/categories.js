import { getDb } from "./_db.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-session-id");
  if (req.method === "OPTIONS") return res.status(200).end();

  const sessionId = req.headers["x-session-id"];
  if (!sessionId) return res.status(401).json({ error: "x-session-id header required" });

  const sql = getDb();

  if (req.method === "GET") {
    const rows = await sql`SELECT * FROM categories WHERE session_id = ${sessionId}`;
    const obj = {};
    rows.forEach(r => {
      obj[r.key] = { label: r.label, colorId: r.color_id, color: r.color, light: r.light, dot: r.dot };
    });
    return res.status(200).json(obj);
  }

  // POST: guardar todas las categorías (reemplaza las existentes)
  if (req.method === "POST") {
    const categories = req.body; // { key: { label, colorId, color, light, dot }, ... }
    await sql`DELETE FROM categories WHERE session_id = ${sessionId}`;
    for (const [key, cat] of Object.entries(categories)) {
      await sql`
        INSERT INTO categories (key, session_id, label, color_id, color, light, dot)
        VALUES (${key}, ${sessionId}, ${cat.label}, ${cat.colorId}, ${cat.color}, ${cat.light}, ${cat.dot})
      `;
    }
    return res.status(200).json({ ok: true });
  }

  res.status(405).end();
}
