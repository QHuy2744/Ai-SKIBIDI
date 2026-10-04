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
    name: "AI Survival Free"
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy"
  });
});

app.post("/api/agent", async (req, res) => {
  if (busy) {
    return res.status(429).json({
      error: "AI đang xử lý lượt trước."
    });
  }

  busy = true;

  try {
    const state = req.body?.state || {};

    const wallet = Number(state.wallet || 100000);
    const day = Number(state.day || 1);
    const energy = Number(state.energy || 100);
    const knowledge = Number(state.knowledge || 0);

    const choices = [
      ["Freelance", 18000, 0.25],
      ["Sản phẩm số", 25000, 0.35],
      ["Tạo nội dung", 15000, 0.30],
      ["Nghiên cứu thị trường", 8000, 0.10],
      ["Tiếp thị", 30000, 0.40]
    ];

    let choice;

    if (wallet < 30000) {
      choice = choices[3];
    } else {
      choice = choices[Math.floor(Math.random() * choices.length)];
    }

    const name = choice[0];
    const reward = choice[1];
    const risk = choice[2];

    const chance = 0.55 + knowledge / 300 - risk;
    const success = Math.random() < chance;

    const change = success
      ? reward
      : -Math.floor(reward * risk);

    const newWallet = Math.max(0, wallet + change);
    const newKnowledge = Math.min(
      100,
      knowledge + (success ? 3 : 1)
    );

    res.json({
      ok: true,
      result: {
        thought: `AI phân tích ví ${wallet.toLocaleString("vi-VN")}đ và chọn hướng phù hợp.`,
        search: `Tìm cơ hội công khai về ${name}.`,
        findings: `Đánh giá rủi ro ${(risk * 100).toFixed(0)}%.`,
        opportunity: name,
        action: success ? "Thành công" : "Thất bại",
        moneyChange: change,
        wallet: newWallet,
        knowledge: newKnowledge,
        energy: Math.max(0, energy - 5),
        day: day + 1,
        alive: newWallet > 0,
        lesson: success
          ? "AI ghi nhớ chiến lược thành công."
          : "AI ghi nhớ rủi ro của chiến lược này."
      }
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });

  } finally {
    busy = false;
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("AI Survival running on port " + PORT);
});
