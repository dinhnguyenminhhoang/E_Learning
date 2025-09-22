'use client'

import { motion, useAnimation, type Variants } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowRight,
  Award,
  Camera,
  Code,
  Globe,
  Palette,
  Play,
  Search,
  Shield,
  Smartphone,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'

type Category = { id: string; name: string; count: string; icon: LucideIcon }
type Stat = {
  label: string
  value: string
  icon: LucideIcon
  color: string
  bgColor: string
}

export default function HeroSection() {
  const controls = useAnimation()
  const [ref, inView] = useInView({ threshold: 0.3, triggerOnce: true })
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories: Category[] = [
    { id: 'all', name: 'Tất cả', count: '2000+', icon: Globe },
    { id: 'web', name: 'Web Design', count: '500+', icon: Code },
    { id: 'mobile', name: 'Mobile UI', count: '300+', icon: Smartphone },
    { id: 'graphic', name: 'Graphic Design', count: '400+', icon: Palette },
    { id: 'photography', name: 'Photography', count: '200+', icon: Camera },
  ]

  const stats: Stat[] = [
    {
      label: 'Portfolio chất lượng',
      value: '2000+',
      icon: Award,
      color: 'from-violet-600 to-purple-600',
      bgColor: 'from-violet-600/20 to-purple-600/20',
    },
    {
      label: 'Khách hàng hài lòng',
      value: '15K+',
      icon: Users,
      color: 'from-blue-600 to-cyan-600',
      bgColor: 'from-blue-600/20 to-cyan-600/20',
    },
    {
      label: 'Đánh giá 5 sao',
      value: '98%',
      icon: Star,
      color: 'from-yellow-600 to-orange-600',
      bgColor: 'from-yellow-600/20 to-orange-600/20',
    },
    {
      label: 'Tăng trưởng hàng tháng',
      value: '150%',
      icon: TrendingUp,
      color: 'from-emerald-600 to-teal-600',
      bgColor: 'from-emerald-600/20 to-teal-600/20',
    },
  ]

  useEffect(() => {
    if (inView) controls.start('visible')
  }, [controls, inView])

  // Easing (cubic-bezier) để tránh lỗi type với string ease
  const EASE_OUT: [number, number, number, number] = [0.33, 1, 0.68, 1]
  const EASE_IN_OUT: [number, number, number, number] = [0.4, 0, 0.2, 1]

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: EASE_OUT },
    },
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // navigate / call API tùy ý
      console.log('Searching for:', searchQuery, 'in category:', selectedCategory)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-violet-400 rounded-full animate-pulse opacity-60" />
        <div className="absolute top-40 right-20 w-1 h-1 bg-pink-400 rounded-full animate-bounce opacity-40" />
        <div className="absolute bottom-32 left-1/4 w-3 h-3 bg-cyan-400 rounded-full animate-ping opacity-30" />
        <div className="absolute top-1/2 right-10 w-2 h-2 bg-yellow-400 rounded-full animate-pulse opacity-50" />

        {/* Large floating orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-violet-600/10 to-purple-600/10 rounded-full blur-2xl"
          animate={{ x: [0, 50, 0], y: [0, -30, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: EASE_IN_OUT }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-gradient-to-r from-pink-600/10 to-indigo-600/10 rounded-full blur-2xl"
          animate={{ x: [0, -40, 0], y: [0, 40, 0], scale: [1, 0.8, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: EASE_IN_OUT, delay: 2 }}
        />
      </div>

      <div className="max-w-7xl mx-auto w-full">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="text-center space-y-12"
        >
          {/* Main Heading */}
          <motion.div variants={itemVariants} className="space-y-8">
            <div className="relative">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 blur-3xl opacity-20"
                animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
                transition={{ duration: 4, repeat: Infinity, ease: EASE_IN_OUT }}
              />
              <h1 className="relative text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="block bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Portfolio
                </span>
                <span className="block bg-gradient-to-r from-pink-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  Marketplace
                </span>
              </h1>
            </div>

            <motion.p
              variants={itemVariants}
              className="text-xl sm:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed"
            >
              Khám phá và sở hữu những
              <span className="text-transparent bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text font-semibold">
                {' '}
                portfolio template chuyên nghiệp{' '}
              </span>
              được thiết kế bởi các chuyên gia hàng đầu
            </motion.p>

            {/* Key Features */}
            <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-4 text-sm">
              {[
                { icon: Zap, text: 'Setup trong 5 phút' },
                { icon: Shield, text: 'Bảo hành trọn đời' },
                { icon: Star, text: 'Chất lượng premium' },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-2 bg-slate-800/30 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-600/30 hover:border-violet-500/50 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                >
                  <feature.icon className="h-4 w-4 text-violet-400" />
                  <span className="text-slate-300">{feature.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Advanced Search */}
          <motion.div variants={itemVariants} className="max-w-4xl mx-auto space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-purple-600/10 to-pink-600/10 rounded-3xl blur-xl" />
              <div className="relative bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-violet-500/20 p-6 md:p-8">
                {/* Search Input */}
                <div className="relative mb-6">
                  <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <Search className="h-6 w-6 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full pl-14 pr-6 py-4 bg-slate-800/50 border border-slate-600/50 rounded-2xl text-slate-100 placeholder-slate-400 text-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-200"
                    placeholder="Tìm kiếm portfolio theo phong cách, ngành nghề, công nghệ..."
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-6 flex items-center"
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 hover:bg-slate-700/50 rounded-full transition-colors"
                      >
                        <Sparkles className="h-5 w-5 text-violet-400" />
                      </motion.div>
                    </button>
                  )}
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap justify-center gap-3 mb-8">
                  {categories.map((category) => (
                    <motion.button
                      key={category.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        selectedCategory === category.id
                          ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-violet-500/25'
                          : 'bg-slate-800/50 text-slate-300 hover:text-white hover:bg-slate-700/50 border border-slate-600/30'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <category.icon className="h-4 w-4" />
                        <span>{category.name}</span>
                        <span className="text-xs opacity-75">({category.count})</span>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSearch}
                    className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white font-semibold rounded-2xl shadow-xl shadow-violet-500/25 transition-all duration-300"
                  >
                    <span className="relative z-10 flex items-center justify-center space-x-2">
                      <Search className="h-5 w-5" />
                      <span>Khám phá ngay</span>
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="group flex items-center justify-center space-x-2 px-8 py-4 bg-slate-800/50 text-slate-300 hover:text-white font-semibold rounded-2xl border border-slate-600/50 hover:border-violet-500/50 transition-all duration-300 backdrop-blur-sm"
                  >
                    <Play className="h-5 w-5" />
                    <span>Xem demo</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Section */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <motion.div key={index} whileHover={{ scale: 1.05, y: -5 }} className="relative group">
                <div className={`absolute inset-0 bg-gradient-to-r ${stat.bgColor} rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300`} />
                <div className="relative bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-violet-500/20 p-6 text-center group-hover:border-violet-400/40 transition-all duration-300">
                  <div className="flex justify-center mb-3">
                    <div className={`p-3 bg-gradient-to-r ${stat.bgColor} rounded-xl border border-violet-500/30`}>
                      <stat.icon className="h-6 w-6 text-violet-400" />
                    </div>
                  </div>
                  <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-400 font-medium">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Social Proof */}
          <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center space-x-2 text-slate-400">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full border-2 border-slate-900 flex items-center justify-center text-white text-xs font-semibold"
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <span>Được tin dùng bởi 15,000+ khách hàng</span>
            </div>

            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
              ))}
              <span className="text-slate-400 ml-2">4.9/5 từ 2,500+ đánh giá</span>
            </div>
          </motion.div>

          {/* Trending Keywords */}
          <motion.div variants={itemVariants} className="space-y-4">
            <p className="text-slate-400 text-sm">Xu hướng tìm kiếm:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['React Portfolio', 'Minimalist Design', 'Photography', 'UI/UX Designer', 'Developer Portfolio', 'Creative Agency'].map(
                (keyword, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSearchQuery(keyword)}
                    className="px-3 py-1 bg-slate-800/30 text-slate-400 hover:text-white text-xs rounded-full border border-slate-600/30 hover:border-violet-500/50 transition-all duration-300"
                  >
                    {keyword}
                  </motion.button>
                )
              )}
            </div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div variants={itemVariants} className="flex flex-col items-center space-y-2 pt-8">
            <p className="text-slate-400 text-sm">Cuộn xuống để khám phá thêm</p>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: EASE_IN_OUT }}
              className="w-6 h-10 border-2 border-violet-400/50 rounded-full flex justify-center"
            >
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: EASE_IN_OUT }}
                className="w-1 h-3 bg-violet-400 rounded-full mt-2"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
