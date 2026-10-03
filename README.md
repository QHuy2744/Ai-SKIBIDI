# AI Survival — Railway Backend

Backend cho AI Survival. Nó giữ OPENAI_API_KEY ở Railway và cung cấp API cho giao diện GitHub Pages.

## 1. Đưa code lên GitHub

Tạo một repo mới, ví dụ:
`ai-survival-backend`

Upload:
- server.js
- package.json
- README.md
- .gitignore

KHÔNG upload API key và KHÔNG tạo file `.env` có key.

## 2. Deploy lên Railway

1. Đăng nhập Railway bằng GitHub.
2. New Project.
3. Deploy from GitHub repo.
4. Chọn `ai-survival-backend`.
5. Railway sẽ nhận ra đây là Node.js app và chạy `npm start`.

Railway tự cấp biến PORT; server đã bind `0.0.0.0` và dùng `process.env.PORT`.

## 3. Thêm API key

Trong Railway:
Service -> Variables -> New Variable

Name:
OPENAI_API_KEY

Value:
API key OpenAI của bạn

Sau đó Deploy/Apply thay đổi.

## 4. Tạo URL public

Service -> Settings -> Networking -> Generate Domain.

Bạn sẽ nhận URL kiểu:
https://ten-app.up.railway.app

Kiểm tra:
https://ten-app.up.railway.app/health

Nếu hiện:
{"status":"healthy", ...}
thì backend đang chạy.

## 5. Nối với giao diện GitHub

Trong file index.html của AI Survival, đặt Worker URL cũ thành URL Railway và gọi:

POST https://ten-app.up.railway.app/api/agent

Body:
{
  "state": {
    "wallet": 100000,
    "turn": 0,
    "day": 1,
    "knowledge": 0,
    "memory": []
  }
}

API key chỉ nằm trên Railway.

## Lưu ý

- AI chỉ mô phỏng tiền.
- Web Search của OpenAI có thể phát sinh phí theo tài khoản API. Kiểm tra pricing trước khi để chế độ tự chạy liên tục.
