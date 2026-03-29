import { getDb } from "./_db.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { credential } = req.body || {};
  if (!credential) return res.status(400).json({ error: "credential requerido" });

  // Verificar token con Google
  const gRes = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`
  );
  if (!gRes.ok) return res.status(401).json({ error: "Token inválido" });

  const payload = await gRes.json();

  // Verificar que el token pertenece a esta app
  const clientId = process.env.VITE_GOOGLE_CLIENT_ID;
  if (payload.aud !== clientId) {
    return res.status(401).json({ error: "Token no corresponde a esta aplicación" });
  }

  const { sub, email, name, picture } = payload;

  // Registrar / actualizar sesión en la base de datos
  const sql = getDb();
  await sql`
    INSERT INTO sessions (id, email, name, picture, updated_at)
    VALUES (${sub}, ${email}, ${name}, ${picture}, NOW())
    ON CONFLICT (id) DO UPDATE SET
      email      = EXCLUDED.email,
      name       = EXCLUDED.name,
      picture    = EXCLUDED.picture,
      updated_at = NOW()
  `;

  return res.status(200).json({ sessionId: sub, email, name, picture });
}
