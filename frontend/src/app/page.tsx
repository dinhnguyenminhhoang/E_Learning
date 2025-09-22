'use client'

import { motion } from 'framer-motion'
import {
  Award,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock,
  Headphones,
  ListChecks,
  Mic,
  Play,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
  Volume2,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Carousel from '@/components/Carousel/Carousel'


const quizPacks = [
  { key: 'a1', title: 'Grammar A1-A2', desc: 'Thì hiện tại cơ bản & cấu trúc câu', items: 15, time: '10 phút', tag: 'CƠ BẢN', difficulty: 'Beginner', progress: 85 },
  { key: 'a2', title: 'Listening - Daily Life', desc: 'Hội thoại thường ngày & giao tiếp', items: 12, time: '8 phút', tag: 'NGHE', difficulty: 'Beginner', progress: 60 },
  { key: 'b1', title: 'Vocabulary B1', desc: 'Từ vựng học thuật & công việc', items: 20, time: '12 phút', tag: 'TỪ VỰNG', difficulty: 'Intermediate', progress: 40 },
  { key: 'b2', title: 'Reading B1-B2', desc: 'Đọc hiểu báo chí & văn bản', items: 10, time: '7 phút', tag: 'ĐỌC', difficulty: 'Intermediate', progress: 20 },
  { key: 'p1', title: 'Pronunciation Focus', desc: 'Âm /θ/ – /ð/ & các âm khó', items: 10, time: '6 phút', tag: 'PHÁT ÂM', difficulty: 'All Levels', progress: 75 },
  { key: 'c1', title: 'IELTS Writing Task 1', desc: 'Mô tả biểu đồ & xu hướng', items: 8, time: '15 phút', tag: 'IELTS', difficulty: 'Advanced', progress: 10 },
]

const vocabList = [
  {
    word: 'sustainable',
    vi: 'bền vững',
    img: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1200&auto=format&fit=crop',
    tip: 'suh-STAY-nuh-buhl',
    level: 'B2',
    category: 'Environment'
  },
  {
    word: 'collaboration',
    vi: 'hợp tác',
    img: 'https://images.unsplash.com/photo-1529336953121-ad5a0d43d0d2?q=80&w=1200&auto=format&fit=crop',
    tip: 'kuh-LAB-uh-RAY-shun',
    level: 'B1',
    category: 'Business'
  },
  {
    word: 'deadline',
    vi: 'hạn chót',
    img: 'https://images.unsplash.com/photo-1527525443983-6e60c75fff46?q=80&w=1200&auto=format&fit=crop',
    tip: 'DED-line',
    level: 'B1',
    category: 'Work'
  },
  {
    word: 'pronunciation',
    vi: 'cách phát âm',
    img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1200&auto=format&fit=crop',
    tip: 'pruh-NUN-see-AY-shun',
    level: 'A2',
    category: 'Language'
  },
  {
    word: 'accuracy',
    vi: 'độ chính xác',
    img: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=1200&auto=format&fit=crop',
    tip: 'AK-yuh-ruh-see',
    level: 'B2',
    category: 'Academic'
  },
  {
    word: 'innovation',
    vi: 'đổi mới',
    img: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?q=80&w=1200&auto=format&fit=crop',
    tip: 'IN-uh-VAY-shun',
    level: 'C1',
    category: 'Technology'
  },
]

// ====== Variants ======
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function HomePage() {
  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }))
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 relative overflow-hidden">
      {/* Enhanced background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 right-1/4 w-96 h-96 bg-sky-500/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-emerald-500/8 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-violet-500/8 rounded-full blur-3xl animate-pulse delay-2000" />
        
        {/* Animated grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:64px_64px] animate-pulse" />
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-sky-400/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* ===== ENHANCED HERO ===== */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 pt-24 md:pt-32 pb-8">
          <motion.div variants={stagger} initial="initial" animate="animate" className="text-center">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-3 rounded-full border border-gradient-to-r from-sky-500/20 to-emerald-500/20 bg-gradient-to-r from-sky-900/40 to-emerald-900/40 px-4 py-2 text-sm backdrop-blur-sm">
              <Sparkles className="h-5 w-5 text-sky-300 animate-pulse" />
              <span className="bg-gradient-to-r from-sky-200 to-emerald-200 bg-clip-text text-transparent font-medium">
                Học thông minh – tối ưu cho sinh viên Việt Nam
              </span>
              <Badge variant="outline" className="border-emerald-400/30 text-emerald-300 text-xs">
                {currentTime}
              </Badge>
            </motion.div>
            
            <motion.h1 variants={fadeUp} className="mt-8 text-4xl md:text-6xl lg:text-7xl font-black leading-tight">
              <span className="bg-gradient-to-r from-sky-200 via-emerald-100 to-violet-200 bg-clip-text text-transparent">
                Luyện tiếng Anh
              </span>
              <br />
              <span className="bg-gradient-to-r from-emerald-300 via-sky-300 to-violet-300 bg-clip-text text-transparent">
                thông minh hơn
              </span>
            </motion.h1>
            
            <motion.p variants={fadeUp} className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-slate-300 leading-relaxed">
              Quiz tương tác • Từ vựng hình ảnh • Phát âm AI • Lộ trình cá nhân hóa
            </motion.p>
            
            <motion.div variants={fadeUp} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="bg-gradient-to-r from-sky-600 via-emerald-600 to-violet-600 hover:from-sky-500 hover:via-emerald-500 hover:to-violet-500 text-white px-8 py-6 text-lg font-semibold shadow-2xl shadow-sky-500/25 hover:shadow-sky-500/40 transition-all duration-300 transform hover:scale-105">
                  <Zap className="h-5 w-5 mr-2" />
                  Bắt đầu miễn phí
                </Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline" className="border-sky-400/40 text-sky-100 hover:bg-sky-900/40 px-8 py-6 text-lg backdrop-blur-sm">
                  <Play className="h-5 w-5 mr-2" />
                  Xem demo
                </Button>
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-8 flex items-center justify-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-400" />
                <span>12,000+ học viên</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-400" />
                <span>4.9/5 đánh giá</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-sky-400" />
                <span>95% hoàn thành khóa học</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { icon: ListChecks, title: 'Quiz thông minh', desc: '5–12 phút / bài', color: 'sky' },
              { icon: BookOpen, title: 'Từ vựng hình ảnh', desc: 'Flashcard + ví dụ', color: 'emerald' },
              { icon: Headphones, title: 'Phát âm AI', desc: 'Chấm điểm thông minh', color: 'violet' },
              { icon: TrendingUp, title: 'Theo dõi tiến độ', desc: 'Phân tích chi tiết', color: 'cyan' }
            ].map((feature, index) => (
              <motion.div key={index} variants={fadeUp}>
                <Card className={`border-${feature.color}-500/20 bg-gradient-to-br from-slate-900/50 to-slate-800/30 hover:from-slate-800/60 hover:to-slate-700/40 backdrop-blur-sm transition-all duration-300 hover:scale-105 group`}>
                  <CardContent className="flex items-center gap-3 py-6">
                    <div className={`p-3 rounded-xl bg-${feature.color}-500/10 border border-${feature.color}-500/20 group-hover:bg-${feature.color}-500/20 transition-colors`}>
                      <feature.icon className={`h-6 w-6 text-${feature.color}-400`} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-100">{feature.title}</p>
                      <p className="text-xs text-slate-400">{feature.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="mt-20 max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-sky-200 to-emerald-200 bg-clip-text text-transparent flex items-center gap-3">
              <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20">
                <ListChecks className="h-6 w-6 text-sky-400" />
              </div>
              Bộ sưu tập Quiz
            </h2>
            <p className="mt-2 text-slate-400">Chọn chủ đề phù hợp với trình độ của bạn</p>
          </div>
          <Link href="/quizzes" className="text-sky-300 hover:text-sky-200 flex items-center gap-2 font-medium transition-colors">
            Xem tất cả <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <Carousel>
          {quizPacks.map((pack) => (
            <Card
              key={pack.key}
              className="border-sky-500/20 bg-gradient-to-br from-slate-900/80 to-slate-800/40 hover:from-slate-800/90 hover:to-slate-700/50 backdrop-blur-sm transition-all duration-300 hover:scale-105 group h-full"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <Badge className={`${
                      pack.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                      pack.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                      pack.difficulty === 'Advanced' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                      'bg-sky-500/20 text-sky-300 border-sky-500/30'
                    } text-xs`}>
                      {pack.difficulty}
                    </Badge>
                    <CardTitle className="text-slate-100 text-lg group-hover:text-sky-200 transition-colors">
                      {pack.title}
                    </CardTitle>
                  </div>
                  <Badge variant="outline" className="bg-sky-500/10 text-sky-300 border-sky-500/30 shrink-0">
                    {pack.tag}
                  </Badge>
                </div>
                <CardDescription className="text-slate-400 text-sm leading-relaxed">
                  {pack.desc}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Target className="h-4 w-4" />
                    <span>{pack.items} câu</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="h-4 w-4" />
                    <span>{pack.time}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Tiến độ</span>
                    <span className="text-slate-300">{pack.progress}%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${pack.progress}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>

                <Link href={`/quizzes/${pack.key}`} className="block">
                  <Button className="w-full bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 text-white font-medium transition-all duration-300 group-hover:shadow-lg group-hover:shadow-sky-500/25">
                    <Play className="h-4 w-4 mr-2" />
                    Làm ngay
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </Carousel>
      </section>

      {/* ===== ENHANCED VOCAB CAROUSEL ===== */}
      <section className="mt-20 max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-200 to-sky-200 bg-clip-text text-transparent flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <BookOpen className="h-6 w-6 text-emerald-400" />
              </div>
              Từ vựng nổi bật
            </h2>
            <p className="mt-2 text-slate-400">Học từ vựng qua hình ảnh và ngữ cảnh thực tế</p>
          </div>
          <Link href="/vocabulary" className="text-emerald-300 hover:text-emerald-200 flex items-center gap-2 font-medium transition-colors">
            Khám phá thêm <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <Carousel>
          {vocabList.map((vocab, index) => (
            <Card
              key={index}
              className="border-emerald-500/20 bg-gradient-to-br from-slate-900/80 to-slate-800/40 hover:from-slate-800/90 hover:to-slate-700/50 backdrop-blur-sm transition-all duration-300 hover:scale-105 group overflow-hidden h-full"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={vocab.img}
                  alt={vocab.word}
                  className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
                <div className="absolute top-3 right-3 flex gap-2">
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
                    {vocab.level}
                  </Badge>
                  <Badge variant="outline" className="bg-slate-900/60 text-slate-200 border-slate-600/50 text-xs backdrop-blur-sm">
                    {vocab.category}
                  </Badge>
                </div>
              </div>
              
              <CardHeader className="pb-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-emerald-200 capitalize text-lg group-hover:text-emerald-100 transition-colors">
                      {vocab.word}
                    </CardTitle>
                    <Badge variant="outline" className="border-emerald-400/40 text-emerald-300 bg-emerald-500/10">
                      {vocab.vi}
                    </Badge>
                  </div>
                  <CardDescription className="text-slate-400 font-mono text-sm bg-slate-800/50 px-3 py-1 rounded-md">
                    /{vocab.tip}/
                  </CardDescription>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 border-emerald-500/40 text-emerald-200 hover:bg-emerald-900/40 hover:text-emerald-100 transition-colors">
                    <Volume2 className="h-4 w-4 mr-2" />
                    Nghe
                  </Button>
                  <Button className="flex-1 bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white transition-all duration-300">
                    <Brain className="h-4 w-4 mr-2" />
                    Học
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </Carousel>
      </section>

      {/* ===== ENHANCED SPEAKING / PRONUNCIATION ===== */}
      <section className="mt-20 max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-200 to-sky-200 bg-clip-text text-transparent">
            Luyện phát âm & nghe thông minh
          </h2>
          <p className="mt-3 text-slate-400 max-w-2xl mx-auto">
            Công nghệ AI tiên tiến giúp cải thiện phát âm và khả năng nghe một cách hiệu quả
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="border-violet-500/20 bg-gradient-to-br from-violet-900/30 to-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-violet-200">
                <div className="p-2 rounded-lg bg-violet-500/20 border border-violet-500/30">
                  <Mic className="h-5 w-5 text-violet-300" />
                </div>
                Kiểm tra phát âm AI
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
                  BETA
                </Badge>
              </CardTitle>
              <CardDescription className="text-slate-400 leading-relaxed">
                Đọc câu mẫu, AI đánh giá độ chính xác và đưa ra gợi ý cải thiện chi tiết.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-950/50 to-slate-900/50 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></div>
                  <span className="text-sm text-slate-300">Recording...</span>
                </div>
                <p className="text-slate-200 leading-relaxed mb-4">
                  "The <span className="text-emerald-300 font-semibold bg-emerald-500/10 px-1 rounded">weather</span> today is 
                  <span className="text-sky-300 font-semibold bg-sky-500/10 px-1 rounded ml-1">pleasant</span> and perfect for a walk."
                </p>
                <div className="flex gap-3">
                  <Button size="sm" className="bg-violet-600 hover:bg-violet-500 text-white">
                    <Mic className="h-4 w-4 mr-2" />
                    Ghi âm
                  </Button>
                  <Button size="sm" variant="outline" className="border-violet-500/40 text-violet-200 hover:bg-violet-900/40">
                    <Volume2 className="h-4 w-4 mr-2" />
                    Nghe mẫu
                  </Button>
                </div>
                <div className="mt-6 p-4 rounded-lg bg-slate-900/50 border border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    <span className="text-emerald-300 font-medium">Phân tích hoàn tất</span>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Độ chính xác tổng thể:</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 bg-slate-700 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                            initial={{ width: 0 }}
                            animate={{ width: '86%' }}
                            transition={{ duration: 1 }}
                          />
                        </div>
                        <span className="text-emerald-300 font-semibold">86%</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Nhấn âm:</span>
                      <span className="text-yellow-300 font-semibold">Cần cải thiện</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Tốc độ nói:</span>
                      <span className="text-emerald-300 font-semibold">Tốt</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="mt-4 w-full border-violet-500/40 text-violet-200 hover:bg-violet-900/40">
                    Xem phân tích chi tiết
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-sky-500/20 bg-gradient-to-br from-sky-900/30 to-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-sky-200">
                <div className="p-2 rounded-lg bg-sky-500/20 border border-sky-500/30">
                  <Headphones className="h-5 w-5 text-sky-300" />
                </div>
                Luyện nghe tương tác
              </CardTitle>
              <CardDescription className="text-slate-400 leading-relaxed">
                Đoạn audio thực tế với câu hỏi thông minh, phù hợp từng trình độ.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-sky-500/30 bg-gradient-to-br from-sky-950/50 to-slate-900/50 p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-sky-500/20 to-emerald-500/20 border border-sky-500/40 flex items-center justify-center relative overflow-hidden">
                    <Headphones className="h-8 w-8 text-sky-300 relative z-10" />
                    <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-emerald-500/10 animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-200">Daily Conversations – Level A2</p>
                    <p className="text-sm text-slate-400 mb-2">At the Coffee Shop</p>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> 2:30
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3" /> 5 câu hỏi
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> 2 người
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-700/50">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-sm text-slate-300">Preparing audio...</span>
                    <div className="ml-auto text-xs text-slate-400">0:00 / 2:30</div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {['Slow', 'Normal', 'Fast'].map((speed, idx) => (
                      <Button
                        key={speed}
                        size="sm"
                        variant={idx === 1 ? "default" : "outline"}
                        className={idx === 1 ? "bg-sky-600 hover:bg-sky-500" : "border-sky-500/40 text-sky-200 hover:bg-sky-900/40"}
                      >
                        {speed}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button className="w-full bg-gradient-to-r from-sky-600 via-emerald-600 to-sky-600 hover:from-sky-500 hover:via-emerald-500 hover:to-sky-500 text-white font-medium">
                  <Play className="h-4 w-4 mr-2" />
                  Bắt đầu luyện nghe
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ===== ENHANCED PROGRESS & GAMIFICATION ===== */}
      <section className="mt-20 max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-200 to-violet-200 bg-clip-text text-transparent">
            Theo dõi tiến trình học tập
          </h2>
          <p className="mt-3 text-slate-400 max-w-2xl mx-auto">
            Hệ thống gamification giúp duy trì động lực học tập mỗi ngày
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-900/30 to-slate-900/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-emerald-200 text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                  Tiến độ tuần này
                </CardTitle>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                  Xuất sắc
                </Badge>
              </div>
              <CardDescription className="text-slate-400">
                Mục tiêu: <span className="text-emerald-300 font-medium">5 bài / tuần</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Hoàn thành</span>
                  <span className="text-emerald-300 font-semibold">4/5 bài</span>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-sky-500 rounded-full relative"
                    initial={{ width: 0 }}
                    animate={{ width: '80%' }}
                    transition={{ duration: 1.5, delay: 0.3 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/50 to-sky-400/50 animate-pulse" />
                  </motion.div>
                </div>
                <p className="text-xs text-slate-400">Còn 1 bài nữa để đạt mục tiêu tuần!</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="text-center p-3 rounded-lg bg-slate-900/50 border border-emerald-500/20">
                  <p className="text-2xl font-bold text-emerald-300">156</p>
                  <p className="text-xs text-slate-400">Phút học</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-slate-900/50 border border-sky-500/20">
                  <p className="text-2xl font-bold text-sky-300">89%</p>
                  <p className="text-xs text-slate-400">Chính xác</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-sky-500/20 bg-gradient-to-br from-sky-900/30 to-slate-900/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-sky-200 text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-sky-400" />
                Chuỗi ngày học
              </CardTitle>
              <CardDescription className="text-slate-400">
                Duy trì streak giúp <span className="text-sky-300 font-medium">nhớ lâu hơn 3x</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-2 p-2 rounded-full bg-gradient-to-r from-sky-500/20 to-emerald-500/20 border border-sky-500/30">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 flex items-center justify-center">
                    <Zap className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sky-200 font-bold text-lg pr-2">7 ngày</span>
                </div>
              </div>
              
              <div className="flex justify-center gap-1">
                {[...Array(7)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className={`h-8 w-8 rounded-lg border flex items-center justify-center text-xs font-medium transition-all ${
                      i < 7 
                        ? 'bg-gradient-to-br from-sky-500/30 to-emerald-500/30 border-sky-500/50 text-sky-200 shadow-lg shadow-sky-500/20' 
                        : 'bg-slate-800/50 border-slate-700/50 text-slate-500'
                    }`}
                  >
                    {i < 7 ? '✓' : i + 1}
                  </motion.div>
                ))}
              </div>
              
              <div className="text-center">
                <p className="text-sm text-slate-300">Streak cao nhất: <span className="text-sky-300 font-semibold">21 ngày</span></p>
                <p className="text-xs text-slate-400 mt-1">Tiếp tục phát huy nhé!</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-violet-500/20 bg-gradient-to-br from-violet-900/30 to-slate-900/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-violet-200 text-lg flex items-center gap-2">
                <Award className="h-5 w-5 text-violet-400" />
                Huy hiệu & Thành tựu
              </CardTitle>
              <CardDescription className="text-slate-400">
                Mở khóa phần thưởng khi đạt mốc quan trọng
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-violet-900/40 to-emerald-900/40 border border-violet-500/30">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-violet-500/30 to-emerald-500/30 border border-violet-500/50 flex items-center justify-center relative">
                  <Star className="h-6 w-6 text-violet-300" />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500/20 to-emerald-500/20 animate-pulse" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-violet-200">Vocabulary Master</p>
                  <p className="text-xs text-slate-400">Học thuộc 100 từ vựng</p>
                  <div className="mt-1">
                    <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 text-xs">
                      MỚI NHẬN
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: '🎯', name: 'First Quiz', earned: true },
                  { icon: '🔥', name: 'Week Streak', earned: true },
                  { icon: '🎵', name: 'Pronunciation Pro', earned: false },
                ].map((badge, idx) => (
                  <div key={idx} className={`p-2 rounded-lg text-center border transition-all ${
                    badge.earned 
                      ? 'bg-violet-500/10 border-violet-500/30 text-violet-200' 
                      : 'bg-slate-800/30 border-slate-700/30 text-slate-500'
                  }`}>
                    <div className="text-lg mb-1">{badge.icon}</div>
                    <p className="text-xs font-medium">{badge.name}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="border-gradient-to-r from-sky-500/20 to-emerald-500/20 bg-gradient-to-r from-sky-900/20 via-slate-900/40 to-emerald-900/20 backdrop-blur-sm">
          <CardContent className="flex flex-col lg:flex-row items-center justify-between gap-6 p-8">
            <div className="text-center lg:text-left space-y-2">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-sky-200 to-emerald-200 bg-clip-text text-transparent">
                Sẵn sàng nâng cao trình độ?
              </h3>
              <p className="text-slate-400 max-w-lg">
                Làm bài kiểm tra đầu vào để nhận lộ trình học tập cá nhân hóa, phù hợp với mục tiêu và thời gian của bạn.
              </p>
              <div className="flex items-center justify-center lg:justify-start gap-6 pt-2 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-sky-400" />
                  <span>15 phút</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-emerald-400" />
                  <span>50 câu hỏi</span>
                </div>
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-violet-400" />
                  <span>AI phân tích</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/placement-test">
                <Button size="lg" className="bg-gradient-to-r from-sky-600 via-emerald-600 to-violet-600 hover:from-sky-500 hover:via-emerald-500 hover:to-violet-500 text-white px-8 shadow-lg shadow-sky-500/25">
                  <Brain className="h-5 w-5 mr-2" />
                  Làm placement test
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-sky-400/40 text-sky-100 hover:bg-sky-900/40 px-8 backdrop-blur-sm">
                <Users className="h-5 w-5 mr-2" />
                Tham gia cộng đồng
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
      <div className="h-20" />
    </div>
  )
}