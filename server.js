import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "100kb" }));

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    name: "AI Survival Railway Backend",
    message: "Backend is running."
  });
});

app.get("/health", (_req, res) => {
  res.json({ status: "healthy", uptime: process.uptime() });
});

app.post("/api/agent", async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "OPENAI_API_KEY chưa được cấu hình trên Railway." });
    }

    const state = req.body?.state || {};

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `You are an autonomous survival agent inside a SAFE SIMULATED ECONOMY.

Your goal is to survive and grow a simulated VND wallet.
IMPORTANT: the wallet is fictional. Never spend or earn real money.

You have NO fixed action list. You must discover opportunities yourself from the public web.
On every turn:
1. Think about the current situation.
2. Search the public web yourself.
3. Inspect and compare what you found.
4. Discover an opportunity rather than choosing from a predefined menu.
5. Choose ONE simulated action.
6. Estimate a realistic simulated result.
7. Learn from the result and remember useful lessons.

Allowed: lawful public opportunities, freelance ideas, marketplaces, educational opportunities, public tools, discounts, open opportunities and similar legitimate ideas.
Forbidden: fraud, scams, spam, impersonation, credential theft, malware, gambling, illegal activity, CAPTCHA/security bypass, or real-money transactions.
Never ask for or expose passwords, OTPs, card numbers, private information or API keys.

CURRENT SIMULATED STATE:
${JSON.stringify(state)}

Return ONLY valid JSON with these fields:
{
  "thought": "short summary of the agent's reasoning",
  "search_query": "the search query you used or intended to use",
  "findings": "short factual summary of relevant web findings",
  "opportunity": "the opportunity discovered",
  "action": "the single simulated action chosen",
  "site": "main website/domain discovered, or empty string",
  "cost_vnd": 0,
  "reward_vnd": 0,
  "reason": "why this simulated action was chosen",
  "lesson": "what the agent learned for future turns"
}

The reward is fictional. Do not claim a website actually paid money.
Keep simulated rewards and costs realistic.`;

    const response = await client.responses.create({
      model: "gpt-5.6-luna",
      tools: [{ type: "web_search" }],
      input: prompt
    });

    const text = response.output_text || "";

    // Remove accidental markdown fences if the model adds them.
    const clean = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let result;
    try {
      result = JSON.parse(clean);
    } catch {
      return res.status(502).json({
        error: "AI không trả về JSON hợp lệ.",
        raw: text.slice(0, 6000)
      });
    }

    return res.json({ ok: true, result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: err?.message || "Unknown server error"
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`AI Survival backend listening on ${PORT}`);
});
