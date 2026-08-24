import { validateClubCode } from "./_validateClubCode.js";

export default async function handler(req, res) {
  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const code = req.method === "GET"
    ? (req.query?.code || "")
    : (req.body?.code || "");
  const result = await validateClubCode(code);
  return res.status(200).json(result);
}
