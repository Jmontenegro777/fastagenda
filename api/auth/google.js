export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { credential } = req.body;
  if (!credential) return res.status(400).json({ error: "credential required" });

  // Verify the Google ID token via Google's tokeninfo endpoint
  const googleRes = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`
  );

  if (!googleRes.ok) {
    return res.status(401).json({ error: "Token de Google inválido" });
  }

  const payload = await googleRes.json();

  if (!payload.sub) {
    return res.status(401).json({ error: "Token inválido" });
  }

  return res.status(200).json({
    id: payload.sub,
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
  });
}
