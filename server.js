import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "100kb" }));

let busy = false;

// =========================
// HOME
// =========================

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    name: "AI Survival Railway Backend",
    message: "Backend is running."
  });
});

// =========================
// HEALTH CHECK
// =========================

app.get("/health", (_req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    busy: busy
  });
});

// =========================
// AI AGENT
// =========================

app.post("/api/agent", async (req, res) => {

  // Không cho nhiều lượt chạy cùng lúc
  if (busy) {
    return res.status(429).json({
      error: "AI đang xử lý lượt trước. Chờ vài giây rồi thử lại."
    });
  }

  // Kiểm tra API Key
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      error: "OPENAI_API_KEY chưa được cấu hình trên Railway."
    });
  }

  busy = true;

  try {

    const state = req.body?.state || {};

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      maxRetries: 0,
      timeout: 18000
    });

    // =========================
    // AI PROMPT
    // =========================

    const prompt = `You are an autonomous agent inside a SAFE SIMULATED ECONOMY.

Your goal is to survive and grow a fictional VND wallet.

IMPORTANT:
No real money is ever spent or earned.

On every turn:

1. Search the public web for a legitimate opportunity.
2. Read and compare useful information.
3. Discover ONE opportunity yourself.
4. Do NOT use a fixed action menu.
5. Choose ONE simulated action.
6. Estimate a fictional cost and reward.
7. Learn one lesson for the next turn.

Allowed:
- legitimate public opportunities
- freelance ideas
- educational opportunities
- public tools
- marketplaces
- discounts
- legal online opportunities

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
- real-money transactions
- passwords
- OTPs
- card numbers
- private information
- API keys

CURRENT SIMULATED STATE:

${JSON.stringify(state)}

Return ONLY valid JSON.

Use exactly this structure:

{
  "thought": "short reasoning summary",
  "search_query": "search query used",
  "findings": "short factual web finding",
  "opportunity": "opportunity discovered",
  "action": "one simulated action",
  "site": "main website or empty string",
  "cost_vnd": 0,
  "reward_vnd": 0,
  "reason": "short reason",
  "lesson": "short lesson"
}

IMPORTANT:

Keep the response concise.

Never claim that a website actually paid money.

All money in this simulation is fictional.`;

    // =========================
    // OPENAI
    // =========================

    const response = await client.responses.create(
      {
        model: "gpt-6-luna",

        tools: [
          {
            type: "web_search"
          }
        ],

        input: prompt
      },
      {
        timeout: 18000,
        maxRetries: 0
      }
    );

    // =========================
    // GET AI TEXT
    // =========================

    const text = response.output_text || "";

    const clean = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    // =========================
    // PARSE JSON
    // =========================

    let result;

    try {

      result = JSON.parse(clean);

    } catch (error) {

      return res.status(502).json({
        error: "AI không trả về JSON hợp lệ.",
        raw: text.slice(0, 3000)
      });

    }

    // =========================
    // SEND RESULT
    // =========================

    return res.json({
      ok: true,
      result: result
    });

  } catch (err) {

    console.error("Agent error:", err);

    let message = err?.message || "Unknown error";

    if (err?.name === "APIConnectionTimeoutError") {
      message = "OpenAI/Web Search phản hồi quá lâu. Hãy thử lại sau vài giây.";
    }

    return res.status(504).json({
      error: message
    });

  } finally {

    busy = false;

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
