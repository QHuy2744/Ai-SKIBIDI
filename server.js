import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let busy = false;

async function searchWeb(query) {
  const url =
    "https://puri.li/api/search?q=" +
    encodeURIComponent(query) +
    "&page=1";

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Web search HTTP " + response.status);
  }

  return await response.json();
}

function chooseOpportunity(results) {
  const items = Array.isArray(results?.results)
    ? results.results
    : [];

  if (!items.length) return null;

  const keywords = [
    "freelance",
    "remote",
    "digital",
    "creator",
    "content",
    "design",
    "developer",
    "online",
    "jobs"
  ];

  const scored = items.map(item => {
    const text = (
      (item.title || "") +
      " " +
      (item.description || "") +
      " " +
      (item.snippet || "")
    ).toLowerCase();

    let score = Math.random() * 5;

    for (const word of keywords) {
      if (text.includes(word)) score += 10;
    }

    return {
      item,
      score
    };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored[0].item;
}

app.get("/", (req, res) => {
  res.json({
    ok: true,
    name: "AI Survival Web Agent",
    mode: "FREE_WEB_SEARCH"
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

    const queries = [
      "freelance online opportunities",
      "remote jobs for beginners",
      "digital products opportunities",
      "content creator opportunities",
      "online business ideas"
    ];

    const query =
      queries[Math.floor(Math.random() * queries.length)];

    const searchData = await searchWeb(query);

    const opportunity = chooseOpportunity(searchData);

    if (!opportunity) {
      return res.json({
        ok: true,
        result: {
          thought: "AI tìm kiếm nhưng chưa tìm được cơ hội phù hợp.",
          search: query,
          findings: "Không có kết quả phù hợp.",
          opportunity: "Không tìm thấy",
          action: "Tiếp tục nghiên cứu",
          moneyChange: 0,
          wallet,
          knowledge: Math.min(100, knowledge + 1),
          energy: Math.max(0, energy - 3),
          day: day + 1,
          alive: wallet > 0
        }
      });
    }

    const title =
      opportunity.title ||
      "Cơ hội từ web";

    const link =
      opportunity.url ||
      opportunity.link ||
      "";

    const snippet =
      opportunity.description ||
      opportunity.snippet ||
      "";

    // Mô phỏng kết quả.
    // Không thực hiện giao dịch tiền thật.
    const success =
      Math.random() < Math.min(
        0.85,
        0.45 + knowledge / 200
      );

    const moneyChange = success
      ? Math.floor(5000 + Math.random() * 25000)
      : -Math.floor(1000 + Math.random() * 5000);

    const newWallet =
      Math.max(0, wallet + moneyChange);

    const newKnowledge =
      Math.min(
        100,
        knowledge + (success ? 4 : 2)
      );

    res.json({
      ok: true,
      result: {
        thought:
          `AI tự chọn truy vấn "${query}", ` +
          `tìm web và đánh giá các kết quả.`,

        search: query,

        findings:
          `${title} — ${snippet}`,

        opportunity: title,

        source: link,

        action: success
          ? "AI mô phỏng thử cơ hội này và thành công."
          : "AI mô phỏng thử cơ hội này nhưng thất bại.",

        moneyChange,

        wallet: newWallet,

        knowledge: newKnowledge,

        energy: Math.max(0, energy - 5),

        day: day + 1,

        alive: newWallet > 0,

        lesson: success
          ? "AI ghi nhớ kiểu cơ hội này có tiềm năng."
          : "AI ghi nhớ rằng cơ hội này có rủi ro.",

        mode: "FREE_WEB_AGENT"
      }
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message
    });

  } finally {
    busy = false;
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    "AI Survival Web Agent running on port " + PORT
  );
});
