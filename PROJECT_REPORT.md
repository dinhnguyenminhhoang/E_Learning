# ĐỀ CƯƠNG CHI TIẾT DỰ ÁN
## Hệ Thống Học Tiếng Anh Trực Tuyến Với AI

---

## I. THÔNG TIN DỰ ÁN

### 1.1. Thông Tin Chung
- **Tên dự án**: Hệ Thống Học Tiếng Anh Trực Tuyến Với AI (E-Learning Platform)
- **Mục tiêu**: Xây dựng nền tảng học tiếng Anh trực tuyến tích hợp AI, cung cấp trải nghiệm học tập cá nhân hóa và hiệu quả
- **Thời gian thực hiện**: [Điền thời gian]
- **Đơn vị thực hiện**: [Tên trường/khoa]

### 1.2. Nhóm Thực Hiện
| STT | Họ và Tên | MSSV | Email | Vai Trò |
|-----|-----------|------|-------|---------|
| 1 | [Tên SV1] | [MSSV1] | [Email1] | Nhóm trưởng, Backend Lead |
| 2 | [Tên SV2] | [MSSV2] | [Email2] | Frontend Lead |
| 3 | [Tên SV3] | [MSSV3] | [Email3] | AI/ML Engineer |
| 4 | [Tên SV4] | [MSSV4] | [Email4] | Database & DevOps |
| 5 | [Tên SV5] | [MSSV5] | [Email5] | UI/UX Designer |

### 1.3. Giảng Viên Hướng Dẫn
- **Họ và tên**: [Tên GVHD]
- **Chức danh**: [Chức danh]
- **Email**: [Email GVHD]

---

## II. TỔNG QUAN DỰ ÁN

### 2.1. Bối Cảnh và Động Lực

#### Bối cảnh
Trong bối cảnh toàn cầu hóa, nhu cầu học tiếng Anh ngày càng tăng cao. Tuy nhiên, các phương pháp học truyền thống gặp nhiều hạn chế:
- Thiếu tính cá nhân hóa
- Chi phí cao cho gia sư/lớp học
- Khó khăn trong việc luyện tập kỹ năng nghe-nói
- Thiếu phản hồi tức thời về lỗi sai

#### Giải pháp công nghệ
Sự phát triển của AI và Machine Learning mở ra cơ hội mới:
- **Chatbot thông minh**: Hỗ trợ học viên 24/7
- **Speech Recognition**: Chấm phát âm tự động
- **NLP Models**: Sửa lỗi ngữ pháp, chấm bài viết
- **Personalization**: Điều chỉnh nội dung theo trình độ

### 2.2. Mục Tiêu Dự Án

#### Mục tiêu chung
Xây dựng một hệ thống E-Learning toàn diện, tích hợp công nghệ AI để hỗ trợ người học tiếng Anh hiệu quả.

#### Mục tiêu cụ thể
1. **Về tính năng**:
   - Cung cấp đầy đủ 4 kỹ năng: Nghe - Nói - Đọc - Viết
   - Tích hợp AI cho chấm bài, sửa lỗi, hỗ trợ học tập
   - Hệ thống quiz/exam đa dạng
   - Theo dõi tiến độ cá nhân

2. **Về công nghệ**:
   - Áp dụng kiến trúc Microservices
   - Sử dụng AI/ML Models tiên tiến (GPT, Whisper, T5)
   - Responsive design cho mọi thiết bị
   - Bảo mật thông tin người dùng

3. **Về trải nghiệm**:
   - Giao diện thân thiện, dễ sử dụng
   - Phản hồi tức thời
   - Học tập theo tiến độ riêng
   - Gamification để tăng động lực

### 2.3. Phạm Vi Dự Án

#### Trong phạm vi
✅ Quản lý người dùng (đăng ký, đăng nhập, OAuth)
✅ Hệ thống khóa học và bài học
✅ Quiz và Exam với tự động chấm điểm
✅ AI Chatbot hỗ trợ học tập
✅ Sửa lỗi ngữ pháp tự động (AI)
✅ Chấm bài viết tự động (AI)
✅ Speech-to-Text và Text-to-Speech
✅ Thanh toán trực tuyến (Stripe)
✅ Dashboard theo dõi tiến độ

#### Ngoài phạm vi
❌ Mobile App native (iOS/Android)
❌ Video call 1-1 với giáo viên
❌ Hệ thống forum/community
❌ Tích hợp với LMS bên ngoài
❌ Chứng chỉ quốc tế (IELTS/TOEFL simulator)

---

## III. PHÂN TÍCH YÊU CẦU

### 3.1. Yêu Cầu Chức Năng

#### 3.1.1. Quản Lý Người Dùng
| ID | Yêu Cầu | Mô Tả | Ưu Tiên |
|----|---------|-------|---------|
| UC-01 | Đăng ký tài khoản | Người dùng có thể đăng ký bằng email/password | Cao |
| UC-02 | Đăng nhập | Đăng nhập bằng email/password, Google, Facebook | Cao |
| UC-03 | Quên mật khẩu | Gửi email reset password | Trung bình |
| UC-04 | Cập nhật profile | Thay đổi thông tin cá nhân, ảnh đại diện | Trung bình |
| UC-05 | Phân quyền | Admin, Teacher, Student với quyền hạn khác nhau | Cao |

#### 3.1.2. Quản Lý Khóa Học
| ID | Yêu Cầu | Mô Tả | Ưu Tiên |
|----|---------|-------|---------|
| CR-01 | Tạo khóa học | Teacher/Admin tạo khóa học mới | Cao |
| CR-02 | Quản lý bài học | CRUD lessons trong course | Cao |
| CR-03 | Content blocks | Hỗ trợ Vocabulary, Grammar, Quiz, Media blocks | Cao |
| CR-04 | Đăng ký khóa học | Student đăng ký và thanh toán khóa học | Cao |
| CR-05 | Theo dõi tiến độ | Hệ thống tracking progress của học viên | Trung bình |

#### 3.1.3. Hệ Thống Quiz/Exam
| ID | Yêu Cầu | Mô Tả | Ưu Tiên |
|----|---------|-------|---------|
| QE-01 | Tạo quiz | Teacher tạo quiz với nhiều loại câu hỏi | Cao |
| QE-02 | Làm bài | Student làm bài quiz/exam | Cao |
| QE-03 | Tự động chấm | Chấm điểm trắc nghiệm tự động | Cao |
| QE-04 | AI chấm bài viết | Sử dụng AI để chấm writing questions | Cao |
| QE-05 | Thống kê kết quả | Hiển thị điểm, phân tích chi tiết | Trung bình |

#### 3.1.4. Tính Năng AI
| ID | Yêu Cầu | Mô Tả | Ưu Tiên |
|----|---------|-------|---------|
| AI-01 | Chatbot | AI chatbot hỗ trợ học tập 24/7 | Cao |
| AI-02 | Grammar correction | Sửa lỗi ngữ pháp tự động | Cao |
| AI-03 | Essay grading | Chấm bài viết với feedback tiếng Việt | Cao |
| AI-04 | Speech-to-Text | Chuyển giọng nói thành văn bản | Trung bình |
| AI-05 | Pronunciation check | Kiểm tra phát âm | Trung bình |
| AI-06 | Vocabulary explanation | Giải thích từ vựng chi tiết | Trung bình |

#### 3.1.5. Thanh Toán
| ID | Yêu Cầu | Mô Tả | Ưu Tiên |
|----|---------|-------|---------|
| PM-01 | Tích hợp Stripe | Thanh toán qua thẻ tín dụng | Cao |
| PM-02 | Gói Premium | Nhiều gói học với giá khác nhau | Cao |
| PM-03 | Lịch sử giao dịch | Xem lịch sử thanh toán | Trung bình |

### 3.2. Yêu Cầu Phi Chức Năng

#### 3.2.1. Performance
- Response time < 2s cho các API thông thường
- Response time < 5s cho AI APIs
- Hỗ trợ tối thiểu 100 concurrent users
- Page load time < 3s

#### 3.2.2. Security
- Mã hóa mật khẩu với bcrypt
- JWT authentication với refresh token
- HTTPS cho mọi request
- Input validation và sanitization
- Rate limiting cho APIs
- XSS và CSRF protection

#### 3.2.3. Scalability
- Kiến trúc Microservices
- Stateless backend
- Database indexing
- Caching với Redis (optional)

#### 3.2.4. Usability
- Responsive design (mobile, tablet, desktop)
- Hỗ trợ tiếng Việt và tiếng Anh
- Accessibility (WCAG 2.1 Level A)
- Intuitive UI/UX

#### 3.2.5. Reliability
- Uptime ≥ 99%
- Error handling và logging
- Data backup hàng ngày
- Recovery plan

---

## IV. THIẾT KẾ HỆ THỐNG

### 4.1. Kiến Trúc Tổng Thể

#### 4.1.1. Mô Hình Kiến Trúc

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Next.js 15 (Frontend)                        │   │
│  │  - React 19 Components                               │   │
│  │  - Tailwind CSS + shadcn/ui                          │   │
│  │  - Tanstack Query (State Management)                 │   │
│  │  - NextAuth.js (Client-side Auth)                    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTPS/REST API
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  APPLICATION LAYER                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │      Node.js/Express Backend                         │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  API Routes                                     │  │   │
│  │  │  - /api/auth    - /api/courses                  │  │   │
│  │  │  - /api/users   - /api/quizzes                  │  │   │
│  │  │  - /api/payments- /api/ai-assistant             │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  Middleware                                     │  │   │
│  │  │  - Authentication (JWT)                         │  │   │
│  │  │  - Authorization (Role-based)                   │  │   │
│  │  │  - Validation (Joi/Express-validator)           │  │   │
│  │  │  - Rate Limiting                                │  │   │
│  │  │  - Error Handling                               │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┴──────────────┐
        ▼                            ▼
┌──────────────────────┐   ┌─────────────────────────┐
│   DATA LAYER         │   │   AI SERVICE LAYER      │
│                      │   │                         │
│  ┌────────────────┐  │   │  ┌──────────────────┐  │
│  │   MongoDB      │  │   │  │  FastAPI Server  │  │
│  │                │  │   │  │                  │  │
│  │  Collections:  │  │   │  │  Models:         │  │
│  │  - users       │  │   │  │  - T5-large      │  │
│  │  - courses     │  │   │  │  - Whisper       │  │
│  │  - lessons     │  │   │  │  - GPT-3.5       │  │
│  │  - quizzes     │  │   │  │                  │  │
│  │  - attempts    │  │   │  │  Endpoints:      │  │
│  │  - payments    │  │   │  │  - /correct      │  │
│  │  - chats       │  │   │  │  - /transcribe   │  │
│  └────────────────┘  │   │  │  - /grade_text   │  │
│                      │   │  └──────────────────┘  │
└──────────────────────┘   └─────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              EXTERNAL SERVICES LAYER                         │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │  Cloudinary  │  │    Stripe    │  │   OpenAI API    │   │
│  │  (CDN)       │  │  (Payment)   │  │   (AI Models)   │   │
│  └──────────────┘  └──────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

#### 4.1.2. Luồng Dữ Liệu

**Ví dụ: Student làm bài Quiz**

```
1. Student → Frontend: Click "Bắt đầu làm bài"
2. Frontend → Backend: GET /api/quizzes/:id
3. Backend → MongoDB: Query quiz data
4. MongoDB → Backend: Return quiz with questions
5. Backend → Frontend: JSON response
6. Frontend: Render quiz UI
7. Student → Frontend: Submit answers
8. Frontend → Backend: POST /api/quiz-attempts
9. Backend → MongoDB: Save attempt
10. Backend → AI Service: POST /api/v1/grade_text (for writing questions)
11. AI Service → OpenAI: Call GPT-3.5-turbo
12. OpenAI → AI Service: Return grading
13. AI Service → Backend: Return AI scores
14. Backend → MongoDB: Update attempt with scores
15. Backend → Frontend: Return results
16. Frontend: Display results to student
```

### 4.2. Cơ Sở Dữ Liệu

#### 4.2.1. Database Schema (MongoDB)

**Collections chính**:

1. **users**
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  fullName: String,
  role: Enum ['student', 'teacher', 'admin'],
  avatar: String (URL),
  googleId: String,
  facebookId: String,
  isEmailVerified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

2. **courses**
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  thumbnail: String,
  level: Enum ['beginner', 'intermediate', 'advanced'],
  price: Number,
  isPremium: Boolean,
  instructor: ObjectId (ref: users),
  category: String,
  lessons: [ObjectId] (ref: lessons),
  enrolledStudents: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

3. **lessons**
```javascript
{
  _id: ObjectId,
  courseId: ObjectId (ref: courses),
  title: String,
  order: Number,
  contentBlocks: [{
    type: Enum ['vocabulary', 'grammar', 'quiz', 'media'],
    content: Mixed (schema depends on type)
  }],
  createdAt: Date,
  updatedAt: Date
}
```

4. **quizzes**
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  lessonId: ObjectId (ref: lessons),
  questions: [{
    type: Enum ['multiple-choice', 'fill-blank', 'writing', 'speaking'],
    question: String,
    options: [String],
    correctAnswer: Mixed,
    points: Number
  }],
  totalPoints: Number,
  timeLimit: Number (minutes),
  createdAt: Date
}
```

5. **quiz_attempts**
```javascript
{
  _id: ObjectId,
  quizId: ObjectId (ref: quizzes),
  userId: ObjectId (ref: users),
  answers: [{
    questionId: ObjectId,
    answer: Mixed,
    isCorrect: Boolean,
    pointsEarned: Number,
    writingGrading: {  // For writing questions
      score: Number,
      level: String,
      comment: String,
      suggestions: [String]
    }
  }],
  totalScore: Number,
  startedAt: Date,
  submittedAt: Date
}
```

#### 4.2.2. Relationships

```
users (1) ──────── (N) courses (instructor)
users (N) ──────── (N) courses (enrolledStudents)
courses (1) ──────── (N) lessons
lessons (1) ──────── (N) quizzes
users (1) ──────── (N) quiz_attempts
quizzes (1) ──────── (N) quiz_attempts
```

### 4.3. API Design

#### 4.3.1. RESTful API Endpoints

**Authentication**
```
POST   /api/v1/auth/register          - Đăng ký
POST   /api/v1/auth/login             - Đăng nhập
POST   /api/v1/auth/logout            - Đăng xuất
POST   /api/v1/auth/refresh-token     - Refresh JWT
POST   /api/v1/auth/forgot-password   - Quên mật khẩu
POST   /api/v1/auth/reset-password    - Reset mật khẩu
GET    /api/v1/auth/google            - Google OAuth
GET    /api/v1/auth/facebook          - Facebook OAuth
```

**Users**
```
GET    /api/v1/users/me               - Thông tin user hiện tại
PUT    /api/v1/users/me               - Cập nhật profile
PUT    /api/v1/users/me/avatar        - Upload avatar
GET    /api/v1/users/:id              - Thông tin user (admin)
GET    /api/v1/users                  - Danh sách users (admin)
```

**Courses**
```
GET    /api/v1/courses                - Danh sách khóa học
GET    /api/v1/courses/:id            - Chi tiết khóa học
POST   /api/v1/courses                - Tạo khóa học (teacher/admin)
PUT    /api/v1/courses/:id            - Cập nhật khóa học
DELETE /api/v1/courses/:id            - Xóa khóa học
POST   /api/v1/courses/:id/enroll     - Đăng ký khóa học
```

**Lessons**
```
GET    /api/v1/lessons/:id            - Chi tiết bài học
POST   /api/v1/courses/:id/lessons    - Tạo bài học
PUT    /api/v1/lessons/:id            - Cập nhật bài học
DELETE /api/v1/lessons/:id            - Xóa bài học
```

**Quizzes**
```
GET    /api/v1/quizzes/:id            - Lấy quiz
POST   /api/v1/lessons/:id/quizzes    - Tạo quiz
PUT    /api/v1/quizzes/:id            - Cập nhật quiz
DELETE /api/v1/quizzes/:id            - Xóa quiz
POST   /api/v1/quizzes/:id/submit     - Nộp bài
GET    /api/v1/quizzes/:id/attempts   - Lịch sử làm bài
```

**AI Assistant**
```
POST   /api/v1/ai-assistant/chat              - Chat với AI
POST   /api/v1/ai-assistant/grammar/correct   - Sửa lỗi ngữ pháp
POST   /api/v1/ai-assistant/vocabulary/explain- Giải thích từ vựng
```

**Speech Services**
```
POST   /api/v1/stt/transcribe         - Chuyển giọng nói thành text
POST   /api/v1/stt/compare            - Kiểm tra phát âm
```

**Payments**
```
POST   /api/v1/payments/create-intent - Tạo payment intent (Stripe)
POST   /api/v1/payments/webhook       - Stripe webhook
GET    /api/v1/payments/history       - Lịch sử giao dịch
```

#### 4.3.2. AI Service APIs (FastAPI)

```
POST   /api/v1/correct                - Sửa lỗi ngữ pháp (T5)
POST   /api/v1/transcribe             - Speech-to-Text (Whisper)
POST   /api/v1/transcribe-and-compare - Kiểm tra phát âm
POST   /api/v1/grade_text             - Chấm bài viết (GPT + T5)
GET    /health                        - Health check
```

---

## V. CÔNG NGHỆ SỬ DỤNG

### 5.1. Frontend

| Công Nghệ | Phiên Bản | Mục Đích |
|-----------|-----------|----------|
| Next.js | 15.4 | React Framework với SSR/SSG |
| React | 19.1 | UI Library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.x | Utility-first CSS |
| shadcn/ui | Latest | UI Components library |
| Tanstack Query | 5.x | Data fetching & caching |
| React Hook Form | 7.x | Form handling |
| Zod | 3.x | Schema validation |
| NextAuth.js | 5.0 | Authentication |
| Framer Motion | 12.x | Animations |

### 5.2. Backend

| Công Nghệ | Phiên Bản | Mục Đích |
|-----------|-----------|----------|
| Node.js | 18+ | Runtime environment |
| Express.js | 4.x | Web framework |
| MongoDB | 6.0+ | NoSQL Database |
| Mongoose | 8.x | ODM for MongoDB |
| JWT | 9.x | Authentication tokens |
| Passport.js | 0.7.x | OAuth strategies |
| Bcrypt | 5.x | Password hashing |
| Joi | 17.x | Validation |
| Multer | 1.4.x | File upload |
| Cloudinary | 1.x | CDN for media |
| Stripe | Latest | Payment processing |
| Nodemailer | 6.x | Email service |

### 5.3. AI/ML Services

| Công Nghệ | Phiên Bản | Mục Đích |
|-----------|-----------|----------|
| Python | 3.8+ | Programming language |
| FastAPI | Latest | API framework |
| PyTorch | 2.x | Deep learning framework |
| Transformers | 4.x | Hugging Face models |
| T5-large | Fine-tuned | Grammar correction |
| OpenAI Whisper | Base | Speech recognition |
| OpenAI GPT-3.5 | Latest | Chatbot & grading |
| Uvicorn | Latest | ASGI server |

### 5.4. DevOps & Tools

| Công Nghệ | Mục Đích |
|-----------|----------|
| Git | Version control |
| GitHub | Code repository |
| npm/yarn | Package management |
| pip | Python package manager |
| ESLint | Code linting (JS/TS) |
| Prettier | Code formatting |
| Postman | API testing |
| VS Code | IDE |

---

## VI. TRIỂN KHAI VÀ KIỂM THỬ

### 6.1. Kế Hoạch Triển Khai

#### Phase 1: Cơ Sở Hạ Tầng (Tuần 1-2)
- [ ] Setup MongoDB database
- [ ] Setup development environment
- [ ] Configure Git repository
- [ ] Setup CI/CD pipeline (optional)

#### Phase 2: Backend Core (Tuần 3-5)
- [ ] Authentication & Authorization
- [ ] User management
- [ ] Course & Lesson CRUD
- [ ] File upload (Cloudinary)

#### Phase 3: Frontend Core (Tuần 6-8)
- [ ] UI/UX design
- [ ] Authentication pages
- [ ] Course listing & detail pages
- [ ] Lesson viewer
- [ ] Responsive design

#### Phase 4: Quiz & Exam (Tuần 9-10)
- [ ] Quiz creation interface
- [ ] Quiz taking interface
- [ ] Auto grading system
- [ ] Results display

#### Phase 5: AI Integration (Tuần 11-13)
- [ ] Setup FastAPI server
- [ ] Integrate T5 model
- [ ] Integrate Whisper model
- [ ] Integrate OpenAI API
- [ ] Connect AI services with backend

#### Phase 6: Payment & Premium (Tuần 14-15)
- [ ] Stripe integration
- [ ] Premium content management
- [ ] Payment history

#### Phase 7: Testing & Optimization (Tuần 16-17)
- [ ] Unit testing
- [ ] Integration testing
- [ ] Performance optimization
- [ ] Bug fixes

#### Phase 8: Deployment & Documentation (Tuần 18)
- [ ] Deploy to production
- [ ] Write documentation
- [ ] Prepare presentation

### 6.2. Chiến Lược Kiểm Thử

#### 6.2.1. Unit Testing
- **Backend**: Jest + Supertest
- **Frontend**: Jest + React Testing Library
- **Target coverage**: ≥ 70%

#### 6.2.2. Integration Testing
- Test API endpoints
- Test database operations
- Test external service integrations

#### 6.2.3. E2E Testing (Optional)
- Playwright/Cypress
- Test critical user flows

#### 6.2.4. Performance Testing
- Load testing với Artillery/k6
- Response time monitoring

---

## VII. RỦI RO VÀ GIẢI PHÁP

| Rủi Ro | Mức Độ | Giải Pháp |
|--------|--------|-----------|
| AI API cost cao | Trung bình | Caching, rate limiting, sử dụng free tier |
| Model inference chậm | Trung bình | Optimize model, sử dụng GPU, caching |
| Khó fine-tune model | Cao | Sử dụng pre-trained models, transfer learning |
| Thiếu kinh nghiệm AI/ML | Cao | Học từ tutorials, documentation, community |
| Database performance | Thấp | Indexing, query optimization |
| Security vulnerabilities | Trung bình | Code review, security best practices |
| Scope creep | Trung bình | Strict scope management, MVP approach |

---

## VIII. KẾT LUẬN

### 8.1. Đóng Góp Dự Án

Dự án này đóng góp:
1. **Về học thuật**: Áp dụng kiến thức về Web Development, AI/ML, Database
2. **Về thực tiễn**: Giải quyết bài toán thực tế trong giáo dục
3. **Về công nghệ**: Tích hợp các công nghệ mới nhất (GPT, Whisper, T5)

### 8.2. Hướng Phát Triển Tương Lai

1. Mobile App (React Native/Flutter)
2. Gamification nâng cao (badges, leaderboards)
3. Video call với giáo viên
4. Community forum
5. Tích hợp thêm ngôn ngữ
6. AR/VR cho immersive learning

### 8.3. Bài Học Kinh Nghiệm

- Làm việc nhóm hiệu quả với Git
- Quản lý dự án với Agile/Scrum
- Tích hợp AI vào web application
- Best practices trong phát triển Full-stack

---

## IX. TÀI LIỆU THAM KHẢO

1. Next.js Documentation - https://nextjs.org/docs
2. OpenAI API Documentation - https://platform.openai.com/docs
3. Hugging Face Transformers - https://huggingface.co/docs
4. MongoDB Documentation - https://docs.mongodb.com
5. Stripe API Documentation - https://stripe.com/docs/api
6. OAuth 2.0 Specification - https://oauth.net/2/
7. RESTful API Design Best Practices
8. Microservices Architecture Patterns

---

**Ngày hoàn thành**: [Điền ngày]
**Chữ ký nhóm trưởng**: __________________
**Xác nhận GVHD**: __________________
