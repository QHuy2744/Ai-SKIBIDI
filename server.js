import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "100kb" }));

// =========================
// HOME
// =========================
app.get("/", (_req, res) => {
  res.json({
    ok: true,
    name: "AI Survival Backend",
    message: "Backend is running."
  });
});

// =========================
// HEALTH CHECK
// =========================
app.get("/health", (_req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime()
  });
});

// =========================
// AI AGENT
// =========================
app.post("/api/agent", async (req, res) => {
  try {
    // Kiểm tra API key
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "OPENAI_API_KEY chưa được cấu hình trên Railway."
      });
    }

    const state = req.body?.state || {};

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const prompt = `
You are an autonomous survival AI inside a SAFE SIMULATED ECONOMY.

The money in this simulation is completely fictional.
Never perform real-money transactions.

Your goal is to survive and increase the simulated VND wallet.

IMPORTANT:
You do NOT have a fixed action list.

Every turn you must:
1. Analyze the current situation.
2. Search the public web yourself.
3. Inspect useful search results.
4. Compare possible opportunities.
5. Discover an opportunity yourself.
6. Choose ONE simulated action.
7. Estimate the fictional result.
8. Learn something useful for the next turn.

The AI should behave autonomously and creatively.

Allowed:
- lawful public opportunities
- freelance ideas
- public marketplaces
- educational opportunities
- public tools
- discounts
- open opportunities
- legitimate ways to simulate earning value

Forbidden:
- fraud
- scams
- spam
- impersonation
- credential theft
- malware
- gambling
- illegal activity
- CAPTCHA bypass
- security bypass
- hacking
- real-money transactions

Never ask for or expose:
- passwords
- OTP codes
- credit/debit card numbers
- private personal information
- API keys

CURRENT SIMULATED STATE:
${JSON.stringify(state)}

Return ONLY valid JSON.

Use exactly these fields:

{
  "thought": "short summary of reasoning",
  "search_query": "search query used or intended",
  "findings": "short factual summary of useful web findings",
  "opportunity": "opportunity discovered",
  "action": "ONE simulated action chosen",
  "site": "main website/domain discovered or empty string",
  "cost_vnd": 0,
  "reward_vnd": 0,
  "reason": "why this action was chosen",
  "lesson": "what was learned for the next turn"
}

IMPORTANT:
- cost_vnd must be a fictional simulated cost.
- reward_vnd must be a fictional simulated reward.
- Never claim a real website actually paid the AI.
- Keep simulated amounts realistic.
- Do not use a predefined action menu.
`;

    // Gọi OpenAI Responses API + Web Search
    const response = await client.responses.create({
      model: "gpt-6-luna",
      tools: [
        {
          type: "web_search"
        }
      ],
      input: prompt
    });

    const text = response.output_text || "";

    // Làm sạch markdown nếu AI trả về ```json
    const clean = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    // Kiểm tra JSON
    let result;

    try {
      result = JSON.parse(clean);
    } catch (error) {
      return res.status(502).json({
        error: "AI không trả về JSON hợp lệ.",
        raw: text.slice(0, 6000)
      });
    }

    // Trả cả output_text để frontend hiện tại của bạn đọc được
    return res.json({
      ok: true,
      output_text: clean,
      result: result
    });

  } catch (err) {
    console.error("AI ERROR:", err);

    return res.status(500).json({
      error: err?.message || "Unknown server error"
    });
  }
});

// =========================
// START SERVER
// =========================
app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `AI Survival backend listening on port ${PORT}`
  );
});
