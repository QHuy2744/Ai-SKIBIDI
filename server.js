import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "100kb" }));

// Không cho nhiều lượt AI chạy cùng lúc
let busy = false;

// Trang kiểm tra server
app.get("/", (_req, res) => {
  res.json({
    ok: true,
    name: "AI Survival Railway Backend",
    message: "Backend is running."
  });
});

// Health check
app.get("/health", (_req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    busy
  });
});

// AI Agent
app.post("/api/agent", async (req, res) => {

  // Nếu AI đang xử lý lượt trước
  if (busy) {
    return res.status(429).json({
      error: "AI đang xử lý lượt trước. Chờ vài giây rồi thử lại."
    });
  }

  // Kiểm tra API key
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

    const prompt = `You are an autonomous agent inside a SAFE SIMULATED ECONOMY.

Goal:
Survive and grow a fictional VND wallet.
No real money is ever spent or earned.

On this turn:

1. Search the public web for a legitimate opportunity.
2. Compare the useful result briefly.
3. Discover ONE opportunity yourself.
4. Do NOT use a fixed action menu.
5. Choose ONE simulated action.
6. Estimate a fictional cost/reward.
7. Give ONE short lesson for the next turn.

Forbidden:
- fraud
- scams
- spam
- impersonation
- credential theft
- malware
- gambling
- illegal activity
- CAPTCHA/security bypass
- real-money transactions
- passwords
- OTPs
- card numbers
- private data
- API keys

CURRENT STATE:
${JSON.stringify(state)}

Return ONLY valid JSON:

{
  "thought": "short reasoning summary",
  "search_query": "query used",
  "findings": "short factual web finding",
  "opportunity": "discovered opportunity",
  "action": "one simulated action",
  "site": "main domain or empty string",
  "cost_vnd": 0,
  "reward_vnd": 0,
  "reason": "short reason",
  "lesson": "short lesson"
}

Keep the answer concise so the turn finishes quickly.

Never claim a website actually paid money.
All rewards are fictional.`;

    const response = await client.responses.create(
      {
       
