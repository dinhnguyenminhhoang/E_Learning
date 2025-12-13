# Hệ Thống Học Tiếng Anh Trực Tuyến Với AI

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15.4-black)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-green)](https://www.mongodb.com/)

## 📚 Giới Thiệu

Hệ thống E-Learning là một nền tảng học tiếng Anh trực tuyến hiện đại, tích hợp công nghệ AI để cung cấp trải nghiệm học tập cá nhân hóa và hiệu quả. Dự án được phát triển bởi nhóm sinh viên với mục tiêu tạo ra một công cụ học tập toàn diện, từ học từ vựng, ngữ pháp, đến luyện tập kỹ năng nghe-nói-đọc-viết.

## ✨ Tính Năng Chính

### 🤖 **Tích Hợp AI**
- **Chatbot Thông Minh**: Hỗ trợ học viên 24/7 với GPT-3.5-turbo
- **Chấm Điểm Tự Động**: Sử dụng AI để chấm bài viết và đưa ra nhận xét chi tiết
- **Sửa Lỗi Ngữ Pháp**: T5 Model được fine-tuned để phát hiện và sửa lỗi
- **Speech-to-Text**: Whisper Model cho phát âm và luyện nghe
- **Text-to-Speech**: Chuyển đổi văn bản thành giọng nói

### 📖 **Quản Lý Học Tập**
- Hệ thống Courses và Lessons có cấu trúc
- Content Blocks đa dạng: Vocabulary, Grammar, Quiz, Media
- Theo dõi tiến độ học tập cá nhân
- Hệ thống Quiz với nhiều loại câu hỏi

### 🎓 **Thi Cử & Đánh Giá**
- Tạo và quản lý bài thi/quiz
- Tự động chấm điểm các câu hỏi trắc nghiệm
- AI chấm bài viết (Writing) với feedback tiếng Việt
- Thống kê kết quả chi tiết

### 👥 **Quản Lý Người Dùng**
- Đăng ký/Đăng nhập (Email, Google, Facebook OAuth)
- Phân quyền: Admin, Teacher, Student
- Profile cá nhân với ảnh đại diện
- Dashboard theo dõi tiến độ

### 💳 **Thanh Toán & Gói Học**
- Tích hợp Stripe Payment
- Nhiều gói học Premium
- Lịch sử giao dịch
- Quản lý đăng ký

## 🏗️ Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────────────────┐
│              Frontend (Next.js 15)                   │
│            React 19 + TypeScript                     │
│        Tailwind CSS + shadcn/ui                      │
└──────────────────┬──────────────────────────────────┘
                   │ REST API
                   ▼
┌─────────────────────────────────────────────────────┐
│           Backend (Node.js/Express)                  │
│       MongoDB + Mongoose ODM                         │
│    JWT Auth + Passport (OAuth)                       │
└──────┬────────────────────┬─────────────────────────┘
       │                    │
       │                    ▼
       │         ┌─────────────────────┐
       │         │  AI Services        │
       │         │  (FastAPI/Python)   │
       │         │  - T5 Model         │
       │         │  - Whisper Model    │
       │         │  - OpenAI GPT       │
       │         └─────────────────────┘
       │
       ▼
┌──────────────────────────┐
│  External Services        │
│  - MongoDB Atlas          │
│  - Cloudinary             │
│  - Stripe                 │
│  - OpenAI API             │
└──────────────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15.4 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Tanstack Query (React Query)
- **Form Handling**: React Hook Form + Zod
- **Authentication**: NextAuth.js v5

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB 6.0+
- **ODM**: Mongoose
- **Authentication**: JWT + Passport (Google/Facebook OAuth)
- **File Upload**: Multer + Cloudinary
- **Payment**: Stripe
- **Email**: Nodemailer

### AI Services
- **Framework**: FastAPI (Python)
- **Models**:
  - T5-large (Fine-tuned for grammar correction)
  - OpenAI Whisper (Speech-to-Text)
  - OpenAI GPT-3.5-turbo (Chatbot & Grading)
- **ML Libraries**: PyTorch, Transformers

## 📦 Cài Đặt

### Yêu Cầu Hệ Thống
- Node.js 18+ và npm/yarn
- Python 3.8+
- MongoDB 6.0+
- Git

### 1. Clone Repository

```bash
git clone git@github.com:dinhnguyenminhhoang/E_Learning.git
cd E_Learning
```

### 2. Cài Đặt Backend

```bash
cd backend
npm install

# Tạo file .env
cp .env.example .env
# Chỉnh sửa .env với thông tin của bạn

# Chạy server
npm run dev  # Development mode
npm start    # Production mode
```

**Backend chạy tại**: `http://localhost:8080`

### 3. Cài Đặt Frontend

```bash
cd frontend
npm install

# Tạo file .env.local
cp .env.example .env.local
# Chỉnh sửa .env.local

# Chạy development server
npm run dev

# Build production
npm run build
npm start
```

**Frontend chạy tại**: `http://localhost:3000`

### 4. Cài Đặt AI Services

```bash
cd Ai_project/APIServer

# Tạo virtual environment
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Tạo file .env
cp .env.example .env
# Thêm OPENAI_API_KEY vào .env

# Chạy server
python main.py
```

**AI Server chạy tại**: `http://localhost:8000`

### 5. Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=8080
MONGODB_URI=mongodb://localhost:27017/e_learning
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=7d

# OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# AI Services
FASTAPI_URL=http://localhost:8000
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_name
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

#### AI Services (.env)
```env
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-3.5-turbo
WHISPER_MODEL_SIZE=base
```

## 🚀 Khởi Chạy Hệ Thống

**Khởi động tất cả services**:

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev

# Terminal 3 - AI Services
cd Ai_project/APIServer && source venv/bin/activate && python main.py
```

**Truy cập**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- AI Services: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 📖 Tài Liệu

- [Đề Cương Chi Tiết](./PROJECT_REPORT.md)
- [Bảng Phân Công Công Việc](./TEAM_CONTRIBUTION.md)
- [Hướng Dẫn Sử Dụng](./USER_GUIDE.md)
- [API Documentation](./backend/README.md)

## 🔑 Tài Khoản Demo

### Admin
- Email: `admin@example.com`
- Password: `admin123`

### Teacher
- Email: `teacher@example.com`
- Password: `teacher123`

### Student
- Email: `student@example.com`
- Password: `student123`

## 🤝 Đóng Góp

Dự án được phát triển bởi nhóm sinh viên:
- Thành viên 1: [Tên] - [Vai trò]
- Thành viên 2: [Tên] - [Vai trò]
- Thành viên 3: [Tên] - [Vai trò]
- Thành viên 4: [Tên] - [Vai trò]
- Thành viên 5: [Tên] - [Vai trò]

Xem chi tiết: [TEAM_CONTRIBUTION.md](./TEAM_CONTRIBUTION.md)

## 📝 License

MIT License - xem [LICENSE](./LICENSE) để biết thêm chi tiết.

## 📞 Liên Hệ

- Repository: [https://github.com/dinhnguyenminhhoang/E_Learning](https://github.com/dinhnguyenminhhoang/E_Learning)
- Issues: [https://github.com/dinhnguyenminhhoang/E_Learning/issues](https://github.com/dinhnguyenminhhoang/E_Learning/issues)

## 🙏 Lời Cảm Ơn

- OpenAI cho GPT-3.5-turbo và Whisper Model
- Hugging Face cho T5 Model
- shadcn/ui cho UI Components
- Tất cả thư viện open-source đã sử dụng

---

**Phát triển với ❤️ bởi Nhóm E-Learning**
