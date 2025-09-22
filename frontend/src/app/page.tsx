'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import MysticBackground from '@/components/MysticBackground/MysticBackground'

// shadcn/ui
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'

// icons
import {
  GraduationCap,
  Rocket,
  Layers,
  Puzzle,
  BookOpenCheck,
  Mic,
  SpellCheck2,
  Target,
  Headphones,
  Trophy,
  Shield,
  Star,
  BarChart3,
  CheckCircle2,
  Timer,
  Sparkles,
  Quote,
} from 'lucide-react'
import Footer from '@/components/layout/Footer'

const PLATFORM_NAME = 'E_LEANING' // đồng bộ brand

export default function HomePage() {
  const router = useRouter()

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-950 via-slate-950 to-emerald-950 text-teal-50">
      {/* nền hiệu ứng (có thể bỏ nếu chưa có component) */}
      <MysticBackground />

      {/* HERO */}
      <section className="relative z-10">
        <div className="mx-auto max-w-6xl px-4 pt-20 md:pt-24">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            {/* Left */}
            <div>
              <div className="mb-4 inline-flex items-center gap-2">
                <Badge className="border-teal-400/40 bg-sky-900/40 text-teal-100">
                  <GraduationCap className="mr-1 h-4 w-4" />
                  Nền tảng học tiếng Anh qua thực hành
                </Badge>
              </div>

              <h1 className="bg-gradient-to-r from-sky-200 via-teal-200 to-emerald-200 bg-clip-text text-4xl font-extrabold leading-tight text-transparent md:text-6xl">
                {PLATFORM_NAME}: Học thông minh qua Quiz, Flashcards &amp; Luyện phát âm AI
              </h1>

              <p className="mt-4 text-lg text-teal-100/85">
                Tập trung vào trải nghiệm **miễn phí** cho đồ án: xếp lớp CEFR,
                luyện nghe–nói–đọc–viết, sửa lỗi từ vựng/chính tả và lộ trình rõ ràng.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button
                  className="h-12 rounded-2xl bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 px-6 text-white hover:from-sky-500 hover:via-teal-500 hover:to-emerald-500"
                  onClick={() => router.push('/signup')}
                >
                  <Rocket className="mr-2 h-5 w-5" />
                  Bắt đầu ngay (Free)
                </Button>

                <Button
                  variant="outline"
                  className="h-12 rounded-2xl border-teal-400/40 px-6 text-teal-100 hover:bg-sky-900/30"
                  asChild
                >
                  <Link href="/placement">
                    <Layers className="mr-2 h-5 w-5" />
                    Làm bài xếp lớp 25’
                  </Link>
                </Button>

                <div className="ml-1 flex items-center gap-2 text-sm text-teal-200/80">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Không VIP, không paywall
                </div>
              </div>

              {/* Fast facts */}
              <div className="mt-8 grid w-full gap-3 sm:grid-cols-3">
                <Card className="border-teal-500/20 bg-slate-900/60">
                  <CardContent className="p-4">
                    <p className="text-2xl font-bold text-sky-100">3,000+</p>
                    <p className="text-sm text-teal-200/75">Câu hỏi Quiz</p>
                  </CardContent>
                </Card>
                <Card className="border-teal-500/20 bg-slate-900/60">
                  <CardContent className="p-4">
                    <p className="text-2xl font-bold text-sky-100">A1 → C1</p>
                    <p className="text-sm text-teal-200/75">Cấp độ CEFR</p>
                  </CardContent>
                </Card>
                <Card className="border-teal-500/20 bg-slate-900/60">
                  <CardContent className="p-4">
                    <p className="text-2xl font-bold text-sky-100">100%</p>
                    <p className="text-sm text-teal-200/75">Tính năng mở khoá</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Right demo */}
            <div className="order-first md:order-last">
              <Card className="border-teal-500/20 bg-gradient-to-br from-slate-900/70 via-sky-950/40 to-black/50 shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-teal-50">
                    <Puzzle className="h-5 w-5 text-sky-300" />
                    Bài luyện mẫu (Demo)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Tabs defaultValue="vocab" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-sky-950/40">
                      <TabsTrigger value="vocab">Từ vựng</TabsTrigger>
                      <TabsTrigger value="grammar">Ngữ pháp</TabsTrigger>
                      <TabsTrigger value="listening">Nghe</TabsTrigger>
                    </TabsList>

                    <TabsContent value="vocab" className="space-y-3">
                      <div className="rounded-2xl border border-teal-500/20 p-4">
                        <p className="text-teal-100">
                          Nghĩa đúng của <span className="font-semibold text-sky-200">“accurate”</span>:
                        </p>
                        <div className="mt-3 grid gap-2">
                          {['chính xác', 'nhanh chóng', 'tiện lợi', 'đáng ngại'].map((opt, i) => (
                            <Button key={i} variant="outline" className="justify-start rounded-xl border-teal-400/40">
                              {opt}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="grammar" className="space-y-3">
                      <div className="rounded-2xl border border-teal-500/20 p-4">
                        <p className="text-teal-100">
                          “If I ____ more time, I would travel.”
                        </p>
                        <div className="mt-3 grid gap-2">
                          {['have', 'had', 'will have', 'would have'].map((opt, i) => (
                            <Button key={i} variant="outline" className="justify-start rounded-xl border-teal-400/40">
                              {opt}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="listening" className="space-y-3">
                      <div className="rounded-2xl border border-teal-500/20 p-4">
                        <p className="text-teal-100">Nghe & chọn đáp án đúng:</p>
                        <div className="mt-2 rounded-xl bg-sky-900/30 p-3 text-sm text-sky-200/90">
                          🎧 “I usually study English in the evening after work.”
                        </div>
                        <div className="mt-3 grid gap-2">
                          {['Buổi tối', 'Buổi sáng', 'Giữa trưa', 'Không rõ'].map((opt, i) => (
                            <Button key={i} variant="outline" className="justify-start rounded-xl border-teal-400/40">
                              {opt}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Mục tiêu ngày */}
                  <div className="rounded-2xl border border-teal-500/20 p-4">
                    <div className="flex items-center justify-between">
                      <p className="flex items-center gap-2 font-medium text-teal-100">
                        <Timer className="h-4 w-4 text-emerald-300" />
                        Mục tiêu hôm nay
                      </p>
                      <span className="text-sm text-sky-200/85">12/20 câu</span>
                    </div>
                    <Progress value={60} className="mt-2" />
                    <div className="mt-2 text-xs text-teal-200/75">Làm 8 câu nữa để nhận huy hiệu 🎖️</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* TÍNH NĂNG CHÍNH */}
      <section className="relative z-10 py-14">
        <div className="mx-auto max-w-6xl px-4">
          <header className="mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-sky-200 via-teal-200 to-emerald-200 bg-clip-text text-transparent">
              Tính năng cho đồ án (Full mở khoá)
            </h2>
            <p className="mt-2 text-teal-100/85">
              Không VIP. Không paywall. Tập trung vào UX/UI & chức năng cốt lõi.
            </p>
          </header>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Puzzle, title: 'Quiz kỹ năng', desc: 'A1–C1: nghe, nói, đọc, viết.', href: '/quiz' },
              { icon: BookOpenCheck, title: 'Flashcards', desc: 'Spaced-repetition + ví dụ.', href: '/flashcards' },
              { icon: Mic, title: 'Phát âm (AI)', desc: 'Chấm điểm, gợi ý khẩu hình.', href: '/practice/pronunciation' },
              { icon: SpellCheck2, title: 'Sửa lỗi', desc: 'Chính tả & từ vựng phổ biến.', href: '/diagnostics/spelling' },
              { icon: Layers, title: 'Xếp lớp', desc: 'Xác định cấp độ khởi điểm.', href: '/placement' },
              { icon: Target, title: 'Lộ trình', desc: 'Theo mục tiêu cá nhân.', href: '/roadmap' },
              { icon: Headphones, title: 'Nghe chủ động', desc: 'Phụ đề tương tác.', href: '/listening/active' },
              { icon: Trophy, title: 'Xếp hạng', desc: 'Đua điểm mỗi tuần.', href: '/leaderboard' },
            ].map((f) => (
              <Link key={f.title} href={f.href}>
                <Card className="h-full border-teal-500/20 bg-slate-900/60 transition-colors hover:border-teal-400/40">
                  <CardContent className="p-6">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-sky-900/40 px-3 py-1 text-xs">
                      <f.icon className="h-4 w-4" />
                      {f.title}
                    </div>
                    <p className="text-teal-200/80">{f.desc}</p>
                    <div className="mt-3 text-sm text-sky-300">Khám phá →</div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* DANH MỤC */}
      <section className="relative z-10 py-6">
        <div className="mx-auto max-w-6xl px-4">
          <header className="mb-6">
            <h3 className="text-2xl font-semibold bg-gradient-to-r from-sky-200 via-teal-200 to-emerald-200 bg-clip-text text-transparent">
              Danh mục luyện tập nhanh
            </h3>
          </header>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Shield, title: 'Ngữ pháp', desc: 'Cơ bản → nâng cao', href: '/quiz/grammar' },
              { icon: Star, title: 'Từ vựng', desc: 'Theo chủ đề & cấp độ', href: '/quiz/vocab' },
              { icon: Headphones, title: 'Nghe hiểu', desc: 'Hội thoại, podcast', href: '/quiz/listening' },
              { icon: BookOpenCheck, title: 'Đọc hiểu', desc: 'Bài đọc ngắn/dài', href: '/quiz/reading' },
            ].map((c) => (
              <Link key={c.title} href={c.href}>
                <Card className="border-teal-500/20 bg-slate-900/60 transition-colors hover:border-teal-400/40">
                  <CardContent className="p-6">
                    <div className="mb-2 flex items-center gap-2">
                      <c.icon className="h-5 w-5 text-sky-300" />
                      <span className="font-medium">{c.title}</span>
                    </div>
                    <p className="text-sm text-teal-200/80">{c.desc}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* LỢI ÍCH / SOCIAL PROOF */}
      <section className="relative z-10 py-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-teal-500/20 bg-slate-900/60">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-emerald-300" />
                  Tiến bộ nhanh
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-teal-200/80">
                  15–25 phút/ngày với quiz rải đều giúp tăng ghi nhớ +40%.
                </p>
              </CardContent>
            </Card>

            <Card className="border-teal-500/20 bg-slate-900/60">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-sky-300" />
                  Cá nhân hoá
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-teal-200/80">
                  Lộ trình theo mục tiêu (CEFR/IELTS/TOEIC) & mức độ hiện tại.
                </p>
              </CardContent>
            </Card>

            <Card className="border-teal-500/20 bg-slate-900/60">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Quote className="h-5 w-5 text-teal-300" />
                  Trải nghiệm tốt
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-teal-200/85">
                  “Giao diện gọn, thao tác nhanh — rất phù hợp làm đồ án.” — Nhóm SV
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ (không nói về VIP) */}
      <section className="relative z-10 py-10">
        <div className="mx-auto max-w-4xl px-4">
          <h3 className="mb-4 text-2xl font-semibold bg-gradient-to-r from-sky-200 via-teal-200 to-emerald-200 bg-clip-text text-transparent">
            Câu hỏi thường gặp
          </h3>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="faq-1">
              <AccordionTrigger className="text-teal-100">Có tính phí/VIP không?</AccordionTrigger>
              <AccordionContent className="text-teal-200/85">
                Không. Đây là đồ án học phần nên tất cả tính năng đều mở khoá để demo.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-2">
              <AccordionTrigger className="text-teal-100">Có bài xếp lớp CEFR?</AccordionTrigger>
              <AccordionContent className="text-teal-200/85">
                Có. Bài placement ~25 phút xác định A1–C1 và gợi ý lộ trình phù hợp.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-3">
              <AccordionTrigger className="text-teal-100">Luyện phát âm hoạt động thế nào?</AccordionTrigger>
              <AccordionContent className="text-teal-200/85">
                Ghi âm, chấm điểm độ khớp âm/nhấn/ ngữ điệu và gợi ý sửa từng từ/cụm.
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              className="h-12 rounded-2xl bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 px-6 text-white hover:from-sky-500 hover:via-teal-500 hover:to-emerald-500"
              onClick={() => router.push('/signup')}
            >
              <Rocket className="mr-2 h-5 w-5" />
              Bắt đầu miễn phí
            </Button>
            <Button
              variant="outline"
              className="h-12 rounded-2xl border-teal-400/40 px-6 text-teal-100 hover:bg-sky-900/30"
              asChild
            >
              <Link href="/courses">Xem khoá học</Link>
            </Button>
          </div>
        </div>
      </section>

     <Footer />
    </main>
  )
}
