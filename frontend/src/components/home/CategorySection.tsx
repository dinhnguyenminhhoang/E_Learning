'use client'

import { motion, type Variants } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowRight,
  Camera,
  Code,
  Layers,
  Palette,
  PenTool,
  Smartphone,
  Star,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useInView } from 'react-intersection-observer'

type Category = {
  id: number
  name: string
  description: string
  icon: LucideIcon
  count: string
  trending: boolean
  color: string
  bgGradient: string
  borderColor: string
  iconBg: string
  examples: string[]
}

export default function CategorySection() {
  const [ref, inView] = useInView({ threshold: 0.2, triggerOnce: true })
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null)

  const categories: Category[] = [
    {
      id: 1,
      name: 'Web Development',
      description:
        'Portfolio cho các nhà phát triển web, full-stack và front-end developers',
      icon: Code,
      count: '500+',
      trending: true,
      color: 'from-blue-600 to-cyan-600',
      bgGradient: 'from-blue-600/10 to-cyan-600/10',
      borderColor: 'border-blue-500/30',
      iconBg: 'bg-blue-600/20',
      examples: ['React Portfolio', 'Vue.js Showcase', 'Angular Portfolio'],
    },
    {
      id: 2,
      name: 'UI/UX Design',
      description:
        'Template cho designers, showcasing creative works và design thinking',
      icon: PenTool,
      count: '350+',
      trending: true,
      color: 'from-purple-600 to-pink-600',
      bgGradient: 'from-purple-600/10 to-pink-600/10',
      borderColor: 'border-purple-500/30',
      iconBg: 'bg-purple-600/20',
      examples: ['Design System', 'Case Studies', 'Creative Portfolio'],
    },
    {
      id: 3,
      name: 'Photography',
      description: 'Portfolio chuyên nghiệp cho photographers và visual artists',
      icon: Camera,
      count: '200+',
      trending: false,
      color: 'from-emerald-600 to-teal-600',
      bgGradient: 'from-emerald-600/10 to-teal-600/10',
      borderColor: 'border-emerald-500/30',
      iconBg: 'bg-emerald-600/20',
      examples: ['Wedding Photos', 'Nature Gallery', 'Portrait Studio'],
    },
    {
      id: 4,
      name: 'Graphic Design',
      description:
        'Showcase cho graphic designers và brand identity specialists',
      icon: Palette,
      count: '400+',
      trending: true,
      color: 'from-orange-600 to-red-600',
      bgGradient: 'from-orange-600/10 to-red-600/10',
      borderColor: 'border-orange-500/30',
      iconBg: 'bg-orange-600/20',
      examples: ['Brand Identity', 'Logo Design', 'Print Design'],
    },
    {
      id: 5,
      name: 'Mobile Apps',
      description: 'Portfolio cho mobile developers và app designers',
      icon: Smartphone,
      count: '250+',
      trending: true,
      color: 'from-violet-600 to-indigo-600',
      bgGradient: 'from-violet-600/10 to-indigo-600/10',
      borderColor: 'border-violet-500/30',
      iconBg: 'bg-violet-600/20',
      examples: ['iOS Apps', 'Android Apps', 'React Native'],
    },
    {
      id: 6,
      name: 'Digital Marketing',
      description: 'Template cho marketers, SEO experts và content creators',
      icon: TrendingUp,
      count: '180+',
      trending: false,
      color: 'from-rose-600 to-pink-600',
      bgGradient: 'from-rose-600/10 to-pink-600/10',
      borderColor: 'border-rose-500/30',
      iconBg: 'bg-rose-600/20',
      examples: ['SEO Results', 'Campaign Portfolio', 'Content Strategy'],
    },
  ]

  // Dùng cubic-bezier thay vì string để tránh lỗi type của framer-motion
  const EASE_OUT: [number, number, number, number] = [0.33, 1, 0.68, 1]

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: EASE_OUT },
    },
  }

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/6 w-64 h-64 bg-gradient-to-r from-violet-600/5 to-purple-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/6 w-80 h-80 bg-gradient-to-r from-pink-600/5 to-rose-600/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="space-y-16"
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center space-y-6">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-violet-600/10 border border-violet-500/20 rounded-full">
              <Layers className="h-4 w-4 text-violet-400" />
              <span className="text-sm text-violet-300 font-medium">
                Danh mục nổi bật
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold">
              <span className="block bg-gradient-to-r from-slate-200 via-white to-slate-300 bg-clip-text text-transparent">
                Tìm portfolio phù hợp
              </span>
              <span className="block bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                với chuyên môn của bạn
              </span>
            </h2>

            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Từ web development đến photography, chúng tôi có đầy đủ các
              template chuyên nghiệp cho mọi lĩnh vực và ngành nghề
            </p>
          </motion.div>

          {/* Categories Grid */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          >
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                variants={itemVariants}
                onHoverStart={() => setHoveredCategory(index)}
                onHoverEnd={() => setHoveredCategory(null)}
                whileHover={{ y: -10, scale: 1.02 }}
                className={`relative group ${
                  hoveredCategory === index ? 'ring-1 ring-violet-400/30' : ''
                }`}
              >
                {/* Card Background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${category.bgGradient} rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300`}
                />

                <div
                  className={`relative bg-slate-900/60 backdrop-blur-xl rounded-2xl border ${category.borderColor} group-hover:border-opacity-60 transition-all duration-300 overflow-hidden`}
                >
                  {/* Trending Badge */}
                  {category.trending && (
                    <div className="absolute top-4 right-4 z-10">
                      <div className="flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full text-xs font-medium text-white">
                        <Zap className="h-3 w-3" />
                        <span>Hot</span>
                      </div>
                    </div>
                  )}

                  <div className="p-6 lg:p-8">
                    {/* Icon & Title */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`p-4 ${category.iconBg} rounded-xl border ${category.borderColor} group-hover:scale-110 transition-transform duration-300`}
                        >
                          <category.icon
                            className={`h-8 w-8 bg-gradient-to-r ${category.color} bg-clip-text text-transparent`}
                            style={{ WebkitTextFillColor: 'transparent' }}
                          />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-violet-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300">
                            {category.name}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span
                              className={`text-sm font-medium bg-gradient-to-r ${category.color} bg-clip-text text-transparent`}
                            >
                              {category.count} templates
                            </span>
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-slate-400">4.8</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-slate-400 mb-6 leading-relaxed">
                      {category.description}
                    </p>

                    {/* Examples */}
                    <div className="space-y-3 mb-6">
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                        Ví dụ phổ biến:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {category.examples.map((example, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-slate-800/50 text-slate-300 text-xs rounded-full border border-slate-600/30"
                          >
                            {example}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    <Link
                      href={`/category/${category.name
                        .toLowerCase()
                        .replace(/[^a-z0-9]/g, '-')}`}
                      className="group/btn relative w-full inline-flex items-center justify-center space-x-2 px-6 py-3 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white font-medium rounded-xl border border-slate-600/30 hover:border-violet-500/50 transition-all duration-300"
                    >
                      <span>Xem tất cả</span>
                      <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  {/* Hover Effect Overlay */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl`}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Bottom CTA */}
          <motion.div variants={itemVariants} className="text-center space-y-6">
            <div className="inline-flex items-center space-x-4 px-6 py-3 bg-slate-800/30 border border-slate-600/30 rounded-2xl">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-violet-400" />
                <span className="text-slate-300">
                  Hơn 15,000 khách hàng đã tin tưởng
                </span>
              </div>
              <div className="w-px h-6 bg-slate-600" />
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
                <span className="text-slate-400 ml-2">4.9/5 rating</span>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-lg text-slate-400">
                Không tìm thấy danh mục phù hợp?
              </p>
              <Link
                href="/categories"
                className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white font-semibold rounded-2xl hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300 group"
              >
                <span>Xem tất cả danh mục</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
