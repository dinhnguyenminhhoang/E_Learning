'use client'

import { motion, type Variants } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import {
  Award,
  CheckCircle,
  ExternalLink,
  Facebook,
  FileText,
  Github,
  Globe,
  Heart,
  HelpCircle,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Send,
  Sparkles,
  TrendingUp,
  Twitter,
  Users,
  Youtube,
  Zap,
  GraduationCap,
  BookOpen,
  Headphones,
  Mic,
  Languages
} from 'lucide-react'
import Link from 'next/link'
import React, { useState } from 'react'
import { useInView } from 'react-intersection-observer'

type FooterLink = {
  name: string
  href: string
  isNew?: boolean
  isHot?: boolean
  isLive?: boolean
}
type FooterSection = {
  title: string
  icon: LucideIcon
  links: FooterLink[]
}
type SocialLink = {
  name: string
  icon: LucideIcon
  href: string
  color: string
  followers: string
}
type LegalLink = { name: string; href: string }
type QuickStat = { label: string; value: string; icon: LucideIcon }

export default function Footer() {
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true })

  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const currentYear = new Date().getFullYear()

  // ===== THEME: sky/teal/emerald to match the new app look =====
  const footerSections: FooterSection[] = [
    {
      title: 'Tính năng học',
      icon: GraduationCap,
      links: [
        { name: 'Khóa học', href: '/courses', isNew: true },
        { name: 'Bài Quiz', href: '/quiz' },
        { name: 'Kiểm tra xếp lớp', href: '/placement', isHot: true },
        { name: 'Luyện phát âm', href: '/practice/pronunciation' },
        { name: 'Từ vựng & Ngữ pháp', href: '/resources' },
        { name: 'Lộ trình học', href: '/paths' },
      ]
    },
    {
      title: 'Luyện tập',
      icon: BookOpen,
      links: [
        { name: 'Nghe', href: '/practice/listening' },
        { name: 'Nói (Mic AI)', href: '/practice/speaking', isLive: true },
        { name: 'Đọc', href: '/practice/reading' },
        { name: 'Viết', href: '/practice/writing' },
        { name: 'Flashcards', href: '/practice/flashcards' },
        { name: 'Thử thách hằng ngày', href: '/challenges' },
      ]
    },
    {
      title: 'Hỗ trợ',
      icon: HelpCircle,
      links: [
        { name: 'Trung tâm trợ giúp', href: '/help' },
        { name: 'Liên hệ', href: '/contact' },
        { name: 'Hướng dẫn sử dụng', href: '/docs' },
        { name: 'Video tutorials', href: '/tutorials' },
        { name: 'FAQ', href: '/faq' },
        { name: 'Live Chat', href: '/chat', isLive: true },
      ]
    },
    {
      title: 'Cộng đồng',
      icon: Languages,
      links: [
        { name: 'Blog học tập', href: '/blog' },
        { name: 'Câu lạc bộ Speaking', href: '/clubs/speaking', isNew: true },
        { name: 'Leaderboard', href: '/leaderboard' },
        { name: 'Sự kiện', href: '/events' },
        { name: 'Đối tác', href: '/partners' },
        { name: 'Về chúng tôi', href: '/about' },
      ]
    }
  ]

  const legalLinks: LegalLink[] = [
    { name: 'Điều khoản sử dụng', href: '/terms' },
    { name: 'Chính sách bảo mật', href: '/privacy' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'GDPR', href: '/gdpr' },
    { name: 'Licenses', href: '/licenses' },
  ]

  const socialLinks: SocialLink[] = [
    { name: 'Twitter',  icon: Twitter,  href: 'https://twitter.com',   color: 'hover:text-sky-400',     followers: '25K' },
    { name: 'GitHub',   icon: Github,   href: 'https://github.com',    color: 'hover:text-slate-200',   followers: '15K' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com',  color: 'hover:text-sky-500',     followers: '50K' },
    { name: 'Instagram',icon: Instagram,href: 'https://instagram.com', color: 'hover:text-rose-400',    followers: '30K' },
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com',  color: 'hover:text-sky-600',     followers: '40K' },
    { name: 'YouTube',  icon: Youtube,  href: 'https://youtube.com',   color: 'hover:text-rose-500',    followers: '100K' },
  ]

  const quickStats: QuickStat[] = [
    { label: 'Bài học', value: '1,200+', icon: FileText },
    { label: 'Học viên', value: '50,000+', icon: Users },
    { label: 'Quiz', value: '8,500+', icon: TrendingUp },
    { label: 'Quốc gia', value: '120+', icon: Globe },
  ]

  const EASE_OUT: [number, number, number, number] = [0.33, 1, 0.68, 1]

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1, y: 0,
      transition: { duration: 0.6, ease: EASE_OUT }
    }
  }

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setIsLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setIsLoading(false)
    setIsSubscribed(true)
    setEmail('')
    setTimeout(() => setIsSubscribed(false), 3000)
  }

  return (
    <footer className="relative overflow-hidden border-t border-teal-600/20 bg-slate-950/90 backdrop-blur-xl">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-gradient-to-r from-sky-600/10 to-teal-600/10 blur-3xl" />
        <div className="absolute top-0 right-1/4 h-80 w-80 rounded-full bg-gradient-to-r from-emerald-600/10 to-sky-600/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#0ea5e9_1px,transparent_1px),linear-gradient(to_bottom,#0ea5e9_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute left-10 top-20 h-1 w-1 animate-pulse rounded-full bg-sky-400 opacity-40" />
        <div className="absolute bottom-32 right-20 h-2 w-2 animate-bounce rounded-full bg-emerald-400 opacity-30" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="space-y-16 py-16"
        >
          {/* Brand + Newsletter */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            {/* Brand */}
            <div className="space-y-6">
              <Link href="/" className="group flex items-center space-x-3">
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600">
                    <Sparkles className="h-7 w-7 text-white" />
                  </div>
                  <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 blur opacity-50 transition-opacity group-hover:opacity-70" />
                </div>
                <div>
                  <h3 className="bg-gradient-to-r from-sky-200 via-teal-200 to-emerald-200 bg-clip-text text-2xl font-bold text-transparent">
                    E_LEANING
                  </h3>
                  <p className="text-sm text-teal-200/70">Học tiếng Anh thông minh</p>
                </div>
              </Link>

              <p className="max-w-md leading-relaxed text-teal-100/80">
                Nền tảng học tiếng Anh qua Quiz, thẻ từ, lộ trình cá nhân hoá và AI chấm phát âm —
                tập trung vào tiến bộ mỗi ngày.
              </p>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {quickStats.map((stat, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    className="rounded-xl border border-teal-600/20 bg-sky-950/30 p-3 text-center transition-all duration-300 hover:border-teal-400/40"
                  >
                    <stat.icon className="mx-auto mb-1 h-5 w-5 text-sky-300" />
                    <div className="text-lg font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-teal-200/70">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="flex items-center space-x-2 text-xl font-semibold text-white">
                  <Mail className="h-5 w-5 text-sky-300" />
                  <span>Đăng ký nhận tin</span>
                </h4>
                <p className="text-teal-200/80">
                  Nhận bài học mới, mẹo học nhanh và thử thách hằng tuần — trực tiếp trong hộp thư của bạn.
                </p>
              </div>

              <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-teal-600/30 bg-sky-950/40 px-4 py-3 text-teal-100 placeholder-teal-300/60 outline-none transition-all duration-200 focus:border-teal-400/60 focus:ring-2 focus:ring-teal-500/30"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <Mail className="h-4 w-4 text-teal-300/70" />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading || isSubscribed}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group flex w-full items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 px-6 py-3 font-medium text-white transition-all duration-300 hover:shadow-lg hover:shadow-sky-500/25 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      <span>Đang đăng ký...</span>
                    </>
                  ) : isSubscribed ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>Đăng ký thành công!</span>
                    </>
                  ) : (
                    <>
                      <span>Đăng ký ngay</span>
                      <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </motion.button>
              </form>

              <div className="space-y-2">
                {[
                  'Bản tin mỗi tuần',
                  'Mẹo luyện phát âm với AI',
                  'Quiz & thử thách thú vị'
                ].map((benefit, i) => (
                  <div key={i} className="flex items-center space-x-2 text-sm text-teal-200/80">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Contact */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 gap-8 border-y border-teal-600/20 py-8 md:grid-cols-3">
            <div className="group flex items-center space-x-4">
              <div className="rounded-xl border border-sky-500/30 bg-gradient-to-r from-sky-600/20 to-teal-600/20 p-3 transition-colors group-hover:border-sky-400/50">
                <Mail className="h-5 w-5 text-sky-300" />
              </div>
              <div>
                <p className="text-sm text-teal-200/70">Email hỗ trợ</p>
                <a href="mailto:hello@eleaning.app" className="transition-colors text-white hover:text-sky-300">
                  hello@eleaning.app
                </a>
              </div>
            </div>

            <div className="group flex items-center space-x-4">
              <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 p-3 transition-colors group-hover:border-emerald-400/50">
                <Phone className="h-5 w-5 text-emerald-300" />
              </div>
              <div>
                <p className="text-sm text-teal-200/70">Hotline 24/7</p>
                <a href="tel:+84123456789" className="transition-colors text-white hover:text-sky-300">
                  +84 (0) 123 456 789
                </a>
              </div>
            </div>

            <div className="group flex items-center space-x-4">
              <div className="rounded-xl border border-teal-500/30 bg-gradient-to-r from-teal-600/20 to-emerald-600/20 p-3 transition-colors group-hover:border-teal-400/50">
                <MapPin className="h-5 w-5 text-teal-300" />
              </div>
              <div>
                <p className="text-sm text-teal-200/70">Văn phòng</p>
                <p className="text-white">Ho Chi Minh City, Vietnam</p>
              </div>
            </div>
          </motion.div>

          {/* Links */}
          <motion.div variants={containerVariants} className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {footerSections.map((section, idx) => (
              <motion.div key={idx} variants={itemVariants} className="space-y-4">
                <h4 className="flex items-center space-x-2 text-lg font-semibold text-white">
                  <section.icon className="h-5 w-5 text-sky-300" />
                  <span>{section.title}</span>
                </h4>
                <ul className="space-y-3">
                  {section.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <Link
                        href={link.href}
                        className="group flex items-center space-x-2 text-sm text-teal-200/80 transition-colors duration-200 hover:text-white"
                      >
                        <span className="transition-transform duration-200 group-hover:translate-x-1">
                          {link.name}
                        </span>
                        {link.isNew && (
                          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300">
                            Mới
                          </span>
                        )}
                        {link.isHot && (
                          <span className="flex items-center space-x-1 rounded-full border border-sky-500/30 bg-sky-500/20 px-2 py-0.5 text-xs text-sky-300">
                            <Zap className="h-3 w-3" />
                            <span>Hot</span>
                          </span>
                        )}
                        {link.isLive && (
                          <span className="flex items-center space-x-1">
                            <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                            <span className="text-xs text-emerald-300">Live</span>
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>

          {/* Social */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h4 className="text-center text-lg font-semibold text-white">Kết nối với chúng tôi</h4>
            <div className="flex justify-center space-x-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`group relative rounded-xl border border-teal-600/20 bg-sky-950/40 p-3 text-teal-200/80 transition-all duration-300 hover:border-teal-500/40 hover:bg-sky-900/40 ${social.color}`}
                >
                  <social.icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                  <div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 rounded bg-slate-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {social.followers} followers
                  </div>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom bar */}
        <motion.div variants={itemVariants} className="border-t border-teal-600/20 py-6">
          <div className="flex flex-col items-center justify-between space-y-4 text-sm md:flex-row md:space-y-0">
            <div className="flex flex-col items-center space-y-2 text-teal-200/80 md:flex-row md:space-y-0 md:space-x-6">
              <span>© {currentYear} E_LEANING. All rights reserved.</span>
              <div className="flex items-center space-x-1">
                <span>Made with</span>
                <Heart className="h-4 w-4 animate-pulse text-rose-400" />
                <span>in Vietnam</span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              {legalLinks.map((link, i) => (
                <Link
                  key={i}
                  href={link.href}
                  className="text-teal-200/80 transition-colors duration-200 hover:text-white hover:underline decoration-sky-400/30"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-teal-200/80">
                <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                <span>All systems operational</span>
              </div>
              <Link
                href="/status"
                className="group flex items-center space-x-1 text-teal-200/80 transition-colors hover:text-white"
              >
                <span>Status</span>
                <ExternalLink className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
