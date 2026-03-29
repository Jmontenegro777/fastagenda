import { getDb } from "./_db.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-session-id");
  if (req.method === "OPTIONS") return res.status(200).end();

  const sessionId = req.headers["x-session-id"];
  if (!sessionId) return res.status(401).json({ error: "x-session-id header required" });

  const sql = getDb();

  if (req.method === "GET") {
    const rows = await sql`SELECT * FROM month_notes WHERE session_id = ${sessionId}`;
    const obj = {};
    rows.forEach(r => { obj[r.month_key] = { text: r.text, checklist: r.checklist }; });
    return res.status(200).json(obj);
  }

  if (req.method === "POST") {
    const { monthKey, text, checklist } = req.body;
    await sql`
      INSERT INTO month_notes (month_key, session_id, text, checklist)
      VALUES (${monthKey}, ${sessionId}, ${text}, ${JSON.stringify(checklist)})
      ON CONFLICT (month_key, session_id) DO UPDATE SET text=${text}, checklist=${JSON.stringify(checklist)}
    `;
    return res.status(200).json({ ok: true });
  }

  res.status(405).end();
}
