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
  Zap
} from 'lucide-react'
import Link from 'next/link'
import React, { useState } from 'react'
import { useInView } from 'react-intersection-observer'

// ===== Types =====
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

  const footerSections: FooterSection[] = [
    {
      title: 'Sản phẩm',
      icon: Sparkles,
      links: [
        { name: 'Portfolio Templates', href: '/portfolios', isNew: true },
        { name: 'Danh mục', href: '/categories' },
        { name: 'Xu hướng', href: '/trending', isHot: true },
        { name: 'Mới nhất', href: '/new' },
        { name: 'Phổ biến nhất', href: '/popular' },
        { name: 'Miễn phí', href: '/free', isNew: true },
      ]
    },
    {
      title: 'Dành cho nhà sáng tạo',
      icon: Users,
      links: [
        { name: 'Trở thành seller', href: '/become-seller' },
        { name: 'Upload portfolio', href: '/upload' },
        { name: 'Hướng dẫn bán hàng', href: '/seller-guide' },
        { name: 'Công cụ marketing', href: '/marketing-tools' },
        { name: 'Analytics', href: '/analytics' },
        { name: 'Cộng đồng seller', href: '/seller-community' },
      ]
    },
    {
      title: 'Hỗ trợ',
      icon: HelpCircle,
      links: [
        { name: 'Trung tâm trợ giúp', href: '/help' },
        { name: 'Liên hệ hỗ trợ', href: '/contact' },
        { name: 'Hướng dẫn sử dụng', href: '/docs' },
        { name: 'Video tutorials', href: '/tutorials' },
        { name: 'FAQ', href: '/faq' },
        { name: 'Live Chat', href: '/chat', isLive: true },
      ]
    },
    {
      title: 'Công ty',
      icon: Award,
      links: [
        { name: 'Về chúng tôi', href: '/about' },
        { name: 'Tuyển dụng', href: '/careers', isNew: true },
        { name: 'Blog', href: '/blog' },
        { name: 'Báo chí', href: '/press' },
        { name: 'Đối tác', href: '/partners' },
        { name: 'Nhà đầu tư', href: '/investors' },
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
    { name: 'Twitter',  icon: Twitter,  href: 'https://twitter.com',   color: 'hover:text-blue-400',  followers: '25K' },
    { name: 'GitHub',   icon: Github,   href: 'https://github.com',    color: 'hover:text-gray-300',  followers: '15K' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com',  color: 'hover:text-blue-500',  followers: '50K' },
    { name: 'Instagram',icon: Instagram,href: 'https://instagram.com', color: 'hover:text-pink-400',  followers: '30K' },
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com',  color: 'hover:text-blue-600',  followers: '40K' },
    { name: 'YouTube',  icon: Youtube,  href: 'https://youtube.com',   color: 'hover:text-red-500',   followers: '100K' },
  ]

  const quickStats: QuickStat[] = [
    { label: 'Templates', value: '2000+', icon: FileText },
    { label: 'Designers', value: '500+', icon: Users },
    { label: 'Downloads', value: '1M+', icon: TrendingUp },
    { label: 'Countries', value: '150+', icon: Globe },
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
    await new Promise(r => setTimeout(r, 1500))
    setIsLoading(false)
    setIsSubscribed(true)
    setEmail('')
    setTimeout(() => setIsSubscribed(false), 3000)
  }

  return (
    <footer className="relative bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/50 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-gradient-to-r from-violet-600/5 to-purple-600/5 rounded-full blur-3xl" />
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-gradient-to-r from-pink-600/5 to-rose-600/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8B5CF6_1px,transparent_1px),linear-gradient(to_bottom,#8B5CF6_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-[0.02]" />
        <div className="absolute top-20 left-10 w-1 h-1 bg-violet-400 rounded-full animate-pulse opacity-40" />
        <div className="absolute bottom-32 right-20 w-2 h-2 bg-pink-400 rounded-full animate-bounce opacity-30" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="py-16 space-y-16"
        >
          {/* Top: Brand + Newsletter */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Brand */}
            <div className="space-y-6">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Sparkles className="h-7 w-7 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 rounded-xl blur opacity-50 -z-10 group-hover:opacity-70 transition-opacity" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Portfolio Market
                  </h3>
                  <p className="text-sm text-slate-400">Premium Templates</p>
                </div>
              </Link>

              <p className="text-slate-400 leading-relaxed max-w-md">
                Nền tảng marketplace hàng đầu cung cấp portfolio templates chuyên nghiệp,
                giúp bạn showcase tài năng và thu hút cơ hội nghề nghiệp.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickStats.map((stat, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    className="text-center p-3 bg-slate-800/30 rounded-xl border border-slate-700/50 hover:border-violet-500/30 transition-all duration-300"
                  >
                    <stat.icon className="h-5 w-5 text-violet-400 mx-auto mb-1" />
                    <div className="text-lg font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-slate-400">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-xl font-semibold text-white flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-violet-400" />
                  <span>Đăng ký newsletter</span>
                </h4>
                <p className="text-slate-400">
                  Nhận thông tin về templates mới, tips thiết kế và ưu đãi đặc biệt trước tiên mỗi tuần.
                </p>
              </div>

              <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-200"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading || isSubscribed}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-6 py-3 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
                      <Send className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </motion.button>
              </form>

              <div className="space-y-2">
                {['Templates mới mỗi tuần', 'Giảm giá độc quyền 20%', 'Tips thiết kế chuyên nghiệp'].map((benefit, i) => (
                  <div key={i} className="flex items-center space-x-2 text-sm text-slate-400">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Contact */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-y border-slate-800/50">
            <div className="flex items-center space-x-4 group">
              <div className="p-3 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-xl border border-blue-500/30 group-hover:border-blue-400/50 transition-colors">
                <Mail className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Email hỗ trợ</p>
                <a href="mailto:hello@portfoliomarket.com" className="text-white hover:text-violet-400 transition-colors">
                  hello@portfoliomarket.com
                </a>
              </div>
            </div>

            <div className="flex items-center space-x-4 group">
              <div className="p-3 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 rounded-xl border border-emerald-500/30 group-hover:border-emerald-400/50 transition-colors">
                <Phone className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Hotline 24/7</p>
                <a href="tel:+84123456789" className="text-white hover:text-violet-400 transition-colors">
                  +84 (0) 123 456 789
                </a>
              </div>
            </div>

            <div className="flex items-center space-x-4 group">
              <div className="p-3 bg-gradient-to-r from-violet-600/20 to-purple-600/20 rounded-xl border border-violet-500/30 group-hover:border-violet-400/50 transition-colors">
                <MapPin className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Văn phòng</p>
                <p className="text-white">Ho Chi Minh City, Vietnam</p>
              </div>
            </div>
          </motion.div>

          {/* Links */}
          <motion.div variants={containerVariants} className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {footerSections.map((section, idx) => (
              <motion.div key={idx} variants={itemVariants} className="space-y-4">
                <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <section.icon className="h-5 w-5 text-violet-400" />
                  <span>{section.title}</span>
                </h4>
                <ul className="space-y-3">
                  {section.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <Link
                        href={link.href}
                        className="group flex items-center space-x-2 text-slate-400 hover:text-white text-sm transition-colors duration-200"
                      >
                        <span className="group-hover:translate-x-1 transition-transform duration-200">
                          {link.name}
                        </span>
                        {link.isNew && (
                          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full border border-emerald-500/30">
                            Mới
                          </span>
                        )}
                        {link.isHot && (
                          <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full border border-orange-500/30 flex items-center space-x-1">
                            <Zap className="h-3 w-3" />
                            <span>Hot</span>
                          </span>
                        )}
                        {link.isLive && (
                          <span className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                            <span className="text-emerald-400 text-xs">Live</span>
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
            <h4 className="text-lg font-semibold text-white text-center">Kết nối với chúng tôi</h4>
            <div className="flex justify-center space-x-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`group relative p-3 bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 ${social.color} rounded-xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300`}
                >
                  <social.icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {social.followers} followers
                  </div>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom bar */}
        <motion.div variants={itemVariants} className="py-6 border-t border-slate-800/50">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-slate-400">
              <span>© {currentYear} Portfolio Market. All rights reserved.</span>
              <div className="flex items-center space-x-1">
                <span>Made with</span>
                <Heart className="h-4 w-4 text-red-400 animate-pulse" />
                <span>in Vietnam</span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 text-sm">
              {legalLinks.map((link, i) => (
                <Link
                  key={i}
                  href={link.href}
                  className="text-slate-400 hover:text-white transition-colors duration-200 hover:underline decoration-violet-400/30"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2 text-slate-400">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span>All systems operational</span>
              </div>
              <Link href="/status" className="text-slate-400 hover:text-white transition-colors flex items-center space-x-1 group">
                <span>Status</span>
                <ExternalLink className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
