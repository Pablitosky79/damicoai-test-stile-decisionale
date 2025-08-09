import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({error:"Method not allowed"});

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const required = ["nome","cognome","email","consenso_informato","privacy","scores","result","gpt_link"];
    for (const k of required) {
      if (body[k] === undefined || body[k] === null || body[k] === "") {
        return res.status(400).json({error: "Missing field: " + k});
      }
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email);
    if (!emailOk) return res.status(400).json({error:"Invalid email"});
    if (!body.consenso_informato || !body.privacy) return res.status(400).json({error:"Consents required"});

    const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").toString().split(",")[0].trim();
    const line = [
      new Date().toISOString(),
      body.nome, body.cognome, body.email,
      body.consenso_informato, body.privacy,
      body.scores?.impulso ?? 0,
      body.scores?.scintilla ?? 0,
      body.scores?.voce ?? 0,
      body.scores?.focus ?? 0,
      body.result, body.gpt_link,
      ip, req.headers["user-agent"] || ""
    ].map(v => typeof v === "string" ? '"' + v.replace(/"/g,'""') + '"' : v).join(",") + "\n";

    const filePath = path.join(process.cwd(), "results.csv");
    if (!fs.existsSync(filePath)) {
      const header = 'created_at,nome,cognome,email,consenso_informato,privacy,scores_impulso,scores_scintilla,scores_voce,scores_focus,result,gpt_link,ip,user_agent\n';
      fs.writeFileSync(filePath, header, "utf8");
    }
    fs.appendFileSync(filePath, line, "utf8");

    res.status(200).json({ok:true});
  } catch (err) {
    res.status(500).json({error:"Server error"});
  }
}
