'use client'

import { motion, useAnimation, type Variants } from 'framer-motion'
import {
  Award,
  CheckCircle,
  Download,
  Globe,
  Heart,
  Shield,
  Star,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useCountUp } from 'react-countup'
import { useInView } from 'react-intersection-observer'

export default function StatsSection() {
  const controls = useAnimation()
  const [ref, inView] = useInView({ threshold: 0.3, triggerOnce: true })
  const [hasAnimated, setHasAnimated] = useState(false)

  const mainStats = [
    {
      id: 1,
      number: 15000,
      suffix: '+',
      label: 'Khách hàng hài lòng',
      description: 'Trên toàn thế giới tin tưởng sản phẩm của chúng tôi',
      icon: Users,
      color: 'from-blue-600 to-cyan-600',
      bgColor: 'from-blue-600/10 to-cyan-600/10',
      iconBg: 'bg-blue-600/20',
      borderColor: 'border-blue-500/30'
    },
    {
      id: 2,
      number: 250000,
      suffix: '+',
      label: 'Lượt tải xuống',
      description: 'Portfolio templates được tải xuống mỗi tháng',
      icon: Download,
      color: 'from-emerald-600 to-teal-600',
      bgColor: 'from-emerald-600/10 to-teal-600/10',
      iconBg: 'bg-emerald-600/20',
      borderColor: 'border-emerald-500/30'
    },
    {
      id: 3,
      number: 4.9,
      suffix: '/5',
      label: 'Đánh giá trung bình',
      description: 'Từ hơn 5,000 reviews của khách hàng',
      icon: Star,
      color: 'from-yellow-600 to-orange-600',
      bgColor: 'from-yellow-600/10 to-orange-600/10',
      iconBg: 'bg-yellow-600/20',
      borderColor: 'border-yellow-500/30'
    },
    {
      id: 4,
      number: 150,
      suffix: '%',
      label: 'Tăng trưởng năm',
      description: 'Tốc độ tăng trưởng khách hàng hàng năm',
      icon: TrendingUp,
      color: 'from-purple-600 to-pink-600',
      bgColor: 'from-purple-600/10 to-pink-600/10',
      iconBg: 'bg-purple-600/20',
      borderColor: 'border-purple-500/30'
    }
  ]

  const achievements = [
    {
      icon: Award,
      title: 'Được công nhận',
      description: 'Top 1 Marketplace Portfolio Template 2024',
      color: 'text-yellow-400'
    },
    {
      icon: Shield,
      title: 'Bảo mật cao',
      description: 'SSL Certificate và GDPR Compliant',
      color: 'text-emerald-400'
    },
    {
      icon: Zap,
      title: 'Tốc độ nhanh',
      description: 'Load time dưới 2 giây cho mọi template',
      color: 'text-orange-400'
    },
    {
      icon: CheckCircle,
      title: 'Chất lượng đảm bảo',
      description: '100% templates được kiểm tra trước khi phát hành',
      color: 'text-blue-400'
    }
  ]

  useEffect(() => {
    if (inView && !hasAnimated) {
      controls.start('visible')
      setHasAnimated(true)
    }
  }, [controls, inView, hasAnimated])

  const EASE_OUT: [number, number, number, number] = [0.33, 1, 0.68, 1]

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.1 } }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE_OUT } }
  }

  // FIX: useCountUp in v6+ cần 'ref'
  const CountUpWrapper = ({
    end,
    suffix,
    duration = 2
  }: {
    end: number
    suffix: string
    duration?: number
  }) => {
    const spanRef = useRef<HTMLElement>(null as unknown as HTMLElement)

    useCountUp({
      ref: spanRef,
      start: 0,
      end,
      duration,
      separator: ',',
      decimal: end < 10 ? '.' : '',
      decimals: end < 10 ? 1 : 0,
      startOnMount: false
    })

    useEffect(() => {
      if (inView && hasAnimated && spanRef.current) {
      }
    }, [inView, hasAnimated])

    const { start } = useCountUp({
      ref: spanRef,
      start: 0,
      end,
      duration,
      separator: ',',
      decimal: end < 10 ? '.' : '',
      decimals: end < 10 ? 1 : 0,
      startOnMount: false,
      // Đảm bảo không lỗi hydration
      enableScrollSpy: false
    })

    useEffect(() => {
      if (inView && hasAnimated) start()
    }, [inView, hasAnimated, start])

    return (
      <span className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
        <span ref={spanRef} />
        {suffix}
      </span>
    )
  }

  // RNG ổn định để tránh hydration mismatch
  function mulberry32(a: number) {
    return function () {
      let t = (a += 0x6D2B79F5)
      t = Math.imul(t ^ (t >>> 15), t | 1)
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  }
  const dots = useMemo(() => {
    const rng = mulberry32(42)
    return Array.from({ length: 8 }).map(() => ({
      top: 20 + rng() * 60,
      left: 20 + rng() * 60
    }))
  }, [])

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/6 w-96 h-96 bg-gradient-to-r from-violet-600/5 to-purple-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/6 w-80 h-80 bg-gradient-to-r from-pink-600/5 to-rose-600/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8B5CF6_1px,transparent_1px),linear-gradient(to_bottom,#8B5CF6_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-[0.03]" />
      </div>

      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="space-y-16"
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center space-y-6">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-violet-600/10 to-purple-600/10 border border-violet-500/20 rounded-full">
              <TrendingUp className="h-4 w-4 text-violet-400" />
              <span className="text-sm text-violet-300 font-medium">Thống kê ấn tượng</span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold">
              <span className="block bg-gradient-to-r from-slate-200 via-white to-slate-300 bg-clip-text text-transparent">
                Được tin dùng bởi
              </span>
              <span className="block bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                hàng ngàn khách hàng
              </span>
            </h2>

            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Những con số ấn tượng chứng minh chất lượng và sự tin tưởng
              mà khách hàng dành cho Portfolio Marketplace
            </p>
          </motion.div>

          {/* Main Stats Grid */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
          >
            {mainStats.map((stat, index) => (
              <motion.div
                key={stat.id}
                variants={itemVariants}
                whileHover={{ y: -10, scale: 1.02 }}
                className="relative group"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300`} />
                <div className={`relative bg-slate-900/60 backdrop-blur-xl rounded-3xl border ${stat.borderColor} group-hover:border-opacity-60 transition-all duration-300 overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-bl-3xl" />
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/5 to-transparent rounded-tr-3xl" />

                  <div className="relative p-6 lg:p-8 text-center space-y-4">
                    <div className="flex justify-center">
                      <div className={`p-4 ${stat.iconBg} rounded-2xl border ${stat.borderColor} group-hover:scale-110 transition-transform duration-300`}>
                        <stat.icon className={`h-8 w-8 bg-gradient-to-r ${stat.color} bg-clip-text`} style={{ WebkitTextFillColor: 'transparent' }} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <CountUpWrapper end={stat.number} suffix={stat.suffix} duration={2.5 + index * 0.2} />
                      <h3 className="text-lg font-semibold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-violet-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300">
                        {stat.label}
                      </h3>
                    </div>

                    <p className="text-sm text-slate-400 leading-relaxed">{stat.description}</p>
                  </div>

                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-3xl`} />
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Achievements Section */}
          <motion.div variants={containerVariants} className="space-y-8">
            <motion.div variants={itemVariants} className="text-center">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Tại sao chọn chúng tôi?</h3>
              <p className="text-slate-400 max-w-2xl mx-auto">Những yếu tố làm nên sự khác biệt của Portfolio Marketplace</p>
            </motion.div>

            <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {achievements.map((achievement, index) => (
                <motion.div key={index} variants={itemVariants} whileHover={{ y: -5 }} className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-800/20 to-slate-900/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                  <div className="relative bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 group-hover:border-violet-500/30 p-6 transition-all duration-300">
                    <div className="space-y-4 text-center">
                      <div className="flex justify-center">
                        <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-600/30 group-hover:border-violet-500/30 transition-all duration-300">
                          <achievement.icon className={`h-6 w-6 ${achievement.color}`} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-lg font-semibold text-white">{achievement.title}</h4>
                        <p className="text-sm text-slate-400 leading-relaxed">{achievement.description}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Global Reach Visualization */}
          <motion.div variants={itemVariants} className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 via-purple-600/5 to-pink-600/5 rounded-3xl blur-xl" />
            <div className="relative bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-violet-500/20 p-8 md:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                {/* Content */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 border border-blue-500/20 rounded-full">
                      <Globe className="h-4 w-4 text-blue-400" />
                      <span className="text-sm text-blue-300 font-medium">Phủ sóng toàn cầu</span>
                    </div>

                    <h3 className="text-3xl md:text-4xl font-bold text-white">
                      Có mặt tại{' '}
                      <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        150+ quốc gia
                      </span>
                    </h3>

                    <p className="text-lg text-slate-400 leading-relaxed">
                      Portfolio Marketplace được tin dùng bởi khách hàng trên toàn thế giới,
                      từ freelancers cá nhân đến các công ty Fortune 500.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { region: 'Châu Á', percentage: 45, color: 'from-blue-500 to-cyan-500' },
                      { region: 'Châu Âu', percentage: 30, color: 'from-emerald-500 to-teal-500' },
                      { region: 'Bắc Mỹ', percentage: 20, color: 'from-violet-500 to-purple-500' },
                      { region: 'Khác', percentage: 5, color: 'from-orange-500 to-red-500' }
                    ].map((region, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-300 font-medium">{region.region}</span>
                          <span className="text-sm text-slate-400">{region.percentage}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                          <motion.div
                            className={`h-full bg-gradient-to-r ${region.color} rounded-full`}
                            initial={{ width: 0 }}
                            animate={inView ? { width: `${region.percentage}%` } : { width: 0 }}
                            transition={{ duration: 1.5, delay: index * 0.2, ease: EASE_OUT }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visual Representation */}
                <div className="relative">
                  <div className="aspect-square max-w-sm mx-auto relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-purple-600/20 to-pink-600/20 rounded-full blur-2xl" />
                    <div className="relative w-full h-full bg-slate-800/30 rounded-full border border-slate-600/30 flex items-center justify-center overflow-hidden">
                      <Globe className="h-24 w-24 text-slate-600" />
                      {dots.map((pos, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-3 h-3 bg-gradient-to-r from-violet-400 to-purple-400 rounded-full"
                          style={{ top: `${pos.top}%`, left: `${pos.left}%` }}
                          animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.3, ease: EASE_OUT }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bottom CTA */}
          <motion.div variants={itemVariants} className="text-center space-y-6">
            <div className="inline-flex items-center space-x-4 px-6 py-3 bg-slate-800/30 border border-slate-600/30 rounded-2xl">
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-red-400" />
                <span className="text-slate-300">Được yêu thích bởi 250,000+ designers</span>
              </div>
            </div>

            <p className="text-lg text-slate-400">
              Tham gia cộng đồng lớn mạnh và phát triển cùng chúng tôi
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
