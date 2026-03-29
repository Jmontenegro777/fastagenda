import { getDb } from "./_db.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-session-id");
  if (req.method === "OPTIONS") return res.status(200).end();

  const sessionId = req.headers["x-session-id"];
  if (!sessionId) return res.status(401).json({ error: "x-session-id header required" });

  const sql = getDb();

  if (req.method === "GET") {
    const rows = await sql`SELECT * FROM tasks WHERE session_id = ${sessionId} ORDER BY date, time`;
    return res.status(200).json(rows.map(r => ({
      id: Number(r.id), cat: r.cat, date: r.date, time: r.time,
      done: r.done, notes: r.notes, reminder: r.reminder
    })));
  }

  if (req.method === "POST") {
    const { id, cat, date, time, done, notes, reminder } = req.body;
    await sql`
      INSERT INTO tasks (id, session_id, cat, date, time, done, notes, reminder)
      VALUES (${id}, ${sessionId}, ${cat}, ${date}, ${time}, ${done}, ${notes || ""}, ${reminder || null})
      ON CONFLICT (id) DO UPDATE SET cat=${cat}, date=${date}, time=${time}, done=${done}, notes=${notes || ""}, reminder=${reminder || null}
    `;
    return res.status(200).json({ ok: true });
  }

  if (req.method === "PUT") {
    const { id, done } = req.body;
    await sql`UPDATE tasks SET done=${done} WHERE id=${id} AND session_id=${sessionId}`;
    return res.status(200).json({ ok: true });
  }

  if (req.method === "DELETE") {
    const id = req.query.id;
    await sql`DELETE FROM tasks WHERE id=${id} AND session_id=${sessionId}`;
    return res.status(200).json({ ok: true });
  }

  res.status(405).end();
}
