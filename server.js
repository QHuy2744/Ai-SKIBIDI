import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let busy = false;

app.get("/", (req, res) => {
  res.json({
    ok: true,
    name: "AI Survival Free Backend",
    message: "Backend is running."
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime()
  });
});

app.post("/api/agent", async (req, res) => {
  if (busy) {
    return res.status(429).json({
      error: "AI đang xử lý lượt trước, chờ một chút."
    });
  }

  busy = true;

  try {
    const state = req.body?.state || {};

    const wallet = Number(state.wallet ?? 100000);
    const day = Number(state.day ?? 1);
    const energy = Number(state.energy ?? 100);
    const knowledge = Number(state.knowledge ?? 0);

    // Bộ não tự chủ miễn phí
    const strategies = [
      {
        name: "Tìm cơ hội freelance",
        risk: 0.25,
        reward: 18000
      },
      {
        name: "Tìm cơ hội bán sản phẩm số",
        risk: 0.35,
        reward: 25000
      },
      {
        name: "Tìm cơ hội tạo nội dung",
        risk: 0.30,
        reward: 15000
      },
      {
        name: "Nghiên cứu thị trường",
        risk: 0.10,
        reward: 8000
      },
      {
        name: "Tìm cơ hội tiếp thị",
        risk: 0.40,
        reward: 30000
      }
    ];

    // Tự chọn chiến lược dựa trên trạng thái hiện tại
    let best = strategies[0];

    if (wallet < 30000) {
      best = strategies[3];
    } else if (knowledge >= 70) {
      best = strategies[4];
    } else if (day % 3 === 0) {
      best = strategies[1];
    } else {
      best = strategies[Math.floor(Math.random() * strategies.length)];
    }

    const successChance =
      0.55 +
      knowledge / 300 -
      best.risk;

    const success = Math.random() < successChance;

    let moneyChange;
    let action;

    if (success) {
      moneyChange = best.reward;
      action = "Cơ hội thành công";
    } else {
      moneyChange = -Math.floor(best.reward * best.risk);
      action = "Cơ hội thất bại";
    }

    const newWallet = Math.max(0, wallet + moneyChange);
    const newKnowledge = Math.min(
      100,
      knowledge + (success ? 3 : 1)
    );

    const result = {
      thought:
        `Ví hiện có ${wallet.toLocaleString("vi-VN")}đ
