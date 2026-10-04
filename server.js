import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "100kb" }));

let busy = false;

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    name: "AI Survival Gemini Backend"
  });
});

app.get("/health", (_req, res) => {
  res.json({
    status: "healthy",
    busy
  });
});

app.post("/api/agent", async (req, res) => {

  if (busy) {
    return res.status(429).json({
      error: "AI đang xử lý lượt trước."
    });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({
      error: "Thiếu GEMINI_API_KEY trên Railway."
    });
  }

  busy = true;

  try {

    const state = req.body?.state || {};

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });

    const prompt = `
You are an autonomous AI inside a SAFE SIMULATED ECONOMY.

Your goal is to survive and grow a fictional VND wallet.

You must:
1. Search the public web.
2. Discover a legitimate opportunity yourself.
3. Compare useful information.
4. Choose ONE simulated action.
5. Estimate fictional cost and reward.
6. Learn a lesson.

Do NOT use a fixed action menu.

Forbidden:
fraud, scams, spam, impersonation, credential theft,
malware, gambling, illegal activity, security bypass,
real-money transactions, passwords, OTPs, card numbers,
private information or API keys.

CURRENT STATE:
${JSON.stringify(state)}

Return ONLY JSON:

{
  "thought": "short reasoning",
  "search_query": "search query",
  "findings": "web findings",
  "opportunity": "discovered opportunity",
  "action": "one simulated action",
  "site": "website",
  "cost_vnd": 0,
  "reward_vnd": 0,
  "reason": "why",
  "lesson": "lesson"
}

All money is fictional.
Never claim a website actually paid money.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash",
      contents: prompt,
      config: {
        tools: [
          {
            googleSearch: {}
          }
        ],
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "";

    const clean = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const result = JSON.parse(clean);

    res.json({
      ok: true,
      result
    });

  } catch (err) {

    console.error("Gemini error:", err);

    res.status(500).json({
      error: err?.message || "Gemini API error"
    });

  } finally {

    busy = false;

  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `AI Survival Gemini backend running on port ${PORT}`
  );
});
