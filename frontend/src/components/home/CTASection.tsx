'use client'

import { motion, type Variants } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  CheckCircle,
  Globe,
  Rocket,
  Shield,
  Sparkles,
  Star,
  Users,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { useInView } from 'react-intersection-observer'

type Feature = {
  icon: LucideIcon
  title: string
  description: string
  color: string
  bgColor: string
}

type TrustIndicator = {
  icon: LucideIcon
  text: string
  avatars?: boolean
  rating?: boolean
  badge?: boolean
  global?: boolean
}

export default function CTASection() {
  const [ref, inView] = useInView({ threshold: 0.2, triggerOnce: true })

  const features: Feature[] = [
    {
      icon: Zap,
      title: 'Setup nhanh chóng',
      description: 'Chỉ 5 phút để có portfolio chuyên nghiệp',
      color: 'from-orange-600 to-yellow-600',
      bgColor: 'from-orange-600/20 to-yellow-600/20'
    },
    {
      icon: Shield,
      title: 'Bảo hành trọn đời',
      description: 'Update miễn phí và support 24/7',
      color: 'from-emerald-600 to-teal-600',
      bgColor: 'from-emerald-600/20 to-teal-600/20'
    },
    {
      icon: Award,
      title: 'Chất lượng đảm bảo',
      description: '100% templates được kiểm tra kỹ lưỡng',
      color: 'from-blue-600 to-cyan-600',
      bgColor: 'from-blue-600/20 to-cyan-600/20'
    }
  ]

  const trustIndicators: TrustIndicator[] = [
    { icon: Users, text: '15,000+ khách hàng hài lòng', avatars: true },
    { icon: Star, text: '4.9/5 rating', rating: true },
    { icon: Shield, text: '30 ngày hoàn tiền', badge: true },
    { icon: Globe, text: 'Có mặt tại 150+ quốc gia', global: true }
  ]

  const EASE_OUT: [number, number, number, number] = [0.33, 1, 0.68, 1]
  const EASE_IN_OUT: [number, number, number, number] = [0.4, 0, 0.2, 1]

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: EASE_OUT }
    }
  }

  const featureVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: EASE_OUT }
    }
  }

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 via-purple-600/5 to-pink-600/5"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-violet-600/10 via-purple-600/10 to-pink-600/10 rounded-full blur-3xl"></div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-violet-400 rounded-full animate-pulse opacity-60"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-pink-400 rounded-full animate-bounce opacity-40"></div>
        <div className="absolute bottom-32 left-1/4 w-3 h-3 bg-cyan-400 rounded-full animate-ping opacity-30"></div>
        <div className="absolute top-1/2 right-10 w-2 h-2 bg-yellow-400 rounded-full animate-pulse opacity-50"></div>
      </div>

      <div className="max-w-6xl mx-auto">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="relative"
        >
          {/* Main CTA Card */}
          <div className="relative">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-purple-600/10 to-pink-600/10 rounded-3xl blur-xl"></div>

            <div className="relative bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-violet-500/20 overflow-hidden">
              {/* Decorative border */}
              <div className="h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500"></div>

              {/* Decorative corners */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-3xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/5 to-transparent rounded-tr-3xl"></div>

              <div className="relative p-8 md:p-12 lg:p-16 text-center space-y-12">
                {/* Header */}
                <motion.div variants={itemVariants} className="space-y-6">
                  <motion.div
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-violet-600/10 to-purple-600/10 border border-violet-500/20 rounded-full"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Rocket className="h-4 w-4 text-violet-400" />
                    <span className="text-sm text-violet-300 font-medium">Bắt đầu ngay hôm nay</span>
                  </motion.div>

                  <div className="relative">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 blur-3xl opacity-20"
                      animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
                      transition={{ duration: 4, repeat: Infinity, ease: EASE_IN_OUT }}
                    />
                    <h2 className="relative text-4xl md:text-5xl lg:text-6xl font-bold">
                      <span className="block bg-gradient-to-r from-slate-200 via-white to-slate-300 bg-clip-text text-transparent">
                        Sẵn sàng tạo
                      </span>
                      <span className="block bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        portfolio tuyệt vời?
                      </span>
                    </h2>
                  </div>

                  <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
                    Tham gia cùng hàng ngàn professionals đã tin tưởng Portfolio Marketplace
                    để showcase tài năng và thu hút cơ hội nghề nghiệp
                  </p>
                </motion.div>

                {/* Features */}
                <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      variants={featureVariants}
                      whileHover={{ y: -5, scale: 1.05 }}
                      className="relative group"
                    >
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${feature.bgColor} rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300`}
                      />
                      <div className="relative bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-violet-500/20 group-hover:border-violet-400/40 p-6 transition-all duration-300">
                        <div className="space-y-4">
                          <div className="flex justify-center">
                            <div
                              className={`p-4 bg-gradient-to-r ${feature.bgColor} rounded-2xl border border-violet-500/30 group-hover:scale-110 transition-transform duration-300`}
                            >
                              <feature.icon className="h-8 w-8 text-violet-400" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-violet-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300">
                              {feature.title}
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* CTA Buttons */}
                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/signup"
                      className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white font-semibold rounded-2xl shadow-xl shadow-violet-500/25 transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/40"
                    >
                      <span className="relative z-10 flex items-center space-x-2">
                        <Sparkles className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                        <span>Đăng ký miễn phí</span>
                        <ArrowUpRight className="h-5 w-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    </Link>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/portfolios"
                      className="group flex items-center space-x-2 px-8 py-4 bg-slate-800/50 text-slate-300 hover:text-white font-semibold rounded-2xl border border-slate-600/50 hover:border-violet-500/50 transition-all duration-300 backdrop-blur-sm"
                    >
                      <span>Xem portfolio mẫu</span>
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                  </motion.div>
                </motion.div>

                {/* Trust Indicators */}
                <motion.div variants={itemVariants} className="pt-8 border-t border-slate-700/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {trustIndicators.map((indicator, index) => (
                      <motion.div
                        key={index}
                        variants={itemVariants}
                        whileHover={{ y: -2 }}
                        className="flex flex-col items-center space-y-3 p-4 bg-slate-800/20 backdrop-blur-sm rounded-xl border border-slate-700/30 hover:border-violet-500/30 transition-all duration-300"
                      >
                        <div className="flex items-center space-x-2">
                          {indicator.avatars && (
                            <div className="flex -space-x-2">
                              {[...Array(5)].map((_, i) => (
                                <div
                                  key={i}
                                  className="w-6 h-6 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full border border-slate-900 flex items-center justify-center text-white text-xs font-semibold"
                                >
                                  {String.fromCharCode(65 + i)}
                                </div>
                              ))}
                            </div>
                          )}

                          {indicator.rating && (
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                              ))}
                            </div>
                          )}

                          {(indicator.badge || indicator.global) && (
                            <div className="p-2 bg-gradient-to-r from-violet-600/20 to-purple-600/20 rounded-full border border-violet-500/30">
                              <indicator.icon className="h-4 w-4 text-violet-400" />
                            </div>
                          )}
                        </div>

                        <span className="text-sm text-slate-400 text-center font-medium">{indicator.text}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Additional CTA */}
                <motion.div variants={itemVariants} className="space-y-4">
                  <div className="flex items-center justify-center space-x-2 text-slate-400">
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                    <span className="text-sm">Không cần thẻ tín dụng • Hủy bất cứ lúc nào</span>
                  </div>
                  <p className="text-slate-500 text-sm">
                    Tham gia cộng đồng 15,000+ designers và developers thành công
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
