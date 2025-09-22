'use client'

import { AnimatePresence, motion, type Variants } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Camera,
  CheckCircle,
  Clock,
  Code,
  Download,
  ExternalLink,
  Eye,
  Heart,
  Palette,
  Play,
  ShoppingCart,
  Smartphone,
  Star,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useInView } from 'react-intersection-observer'

type TabId = 'featured' | 'trending' | 'new' | 'popular'
type Tab = { id: TabId; name: string; icon: LucideIcon }

type Author = {
  name: string
  avatar: string
  verified: boolean
}

type Portfolio = {
  id: number
  title: string
  description: string
  category: string
  categoryIcon: LucideIcon
  price: number
  originalPrice: number
  image: string
  previewUrl: string
  rating: number
  reviews: number
  downloads: number
  likes: number
  author: Author
  tags: string[]
  features: string[]
  isNew: boolean
  isTrending: boolean
  isFeatured: boolean
  isPopular: boolean
  discount: number
  createdAt: string
  lastUpdated: string
}

export default function FeaturedPortfolios() {
  const [ref, inView] = useInView({ threshold: 0.2, triggerOnce: true })
  const [activeTab, setActiveTab] = useState<TabId>('featured')
  const [currentPage, setCurrentPage] = useState(0)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  const tabs: Tab[] = [
    { id: 'featured', name: 'Nổi bật', icon: Award },
    { id: 'trending', name: 'Xu hướng', icon: Zap },
    { id: 'new', name: 'Mới nhất', icon: Star },
    { id: 'popular', name: 'Phổ biến', icon: Users },
  ]

  const portfolios: Portfolio[] = [
    {
      id: 1,
      title: 'Creative Designer Portfolio',
      description:
        'Modern and minimalist portfolio template perfect for creative professionals',
      category: 'UI/UX Design',
      categoryIcon: Palette,
      price: 89,
      originalPrice: 129,
      image: '/api/placeholder/400/300',
      previewUrl: '#',
      rating: 4.9,
      reviews: 156,
      downloads: 2847,
      likes: 1423,
      author: { name: 'Sarah Johnson', avatar: '/api/placeholder/32/32', verified: true },
      tags: ['Figma', 'React', 'Tailwind', 'Responsive'],
      features: ['Dark/Light Mode', 'Animation', 'Mobile First', 'SEO Ready'],
      isNew: false,
      isTrending: true,
      isFeatured: true,
      isPopular: true,
      discount: 31,
      createdAt: '2024-01-15',
      lastUpdated: '2024-08-20',
    },
    {
      id: 2,
      title: 'Developer Showcase',
      description:
        'Professional portfolio template for full-stack developers and programmers',
      category: 'Web Development',
      categoryIcon: Code,
      price: 79,
      originalPrice: 99,
      image: '/api/placeholder/400/300',
      previewUrl: '#',
      rating: 4.8,
      reviews: 203,
      downloads: 3521,
      likes: 1876,
      author: { name: 'Alex Chen', avatar: '/api/placeholder/32/32', verified: true },
      tags: ['Next.js', 'TypeScript', 'Framer Motion', 'API'],
      features: ['Code Snippets', 'Project Gallery', 'Blog', 'Contact Form'],
      isNew: true,
      isTrending: true,
      isFeatured: true,
      isPopular: true,
      discount: 20,
      createdAt: '2024-08-10',
      lastUpdated: '2024-08-22',
    },
    {
      id: 3,
      title: 'Photography Studio',
      description: 'Elegant portfolio template for photographers and visual artists',
      category: 'Photography',
      categoryIcon: Camera,
      price: 69,
      originalPrice: 89,
      image: '/api/placeholder/400/300',
      previewUrl: '#',
      rating: 4.7,
      reviews: 89,
      downloads: 1654,
      likes: 892,
      author: { name: 'Maria Rodriguez', avatar: '/api/placeholder/32/32', verified: false },
      tags: ['Gallery', 'Lightbox', 'Testimonials', 'Booking'],
      features: ['Image Optimization', 'Portfolio Grid', 'Client Area', 'Pricing'],
      isNew: false,
      isTrending: false,
      isFeatured: true,
      isPopular: true,
      discount: 22,
      createdAt: '2024-06-05',
      lastUpdated: '2024-08-15',
    },
    {
      id: 4,
      title: 'Mobile App Showcase',
      description:
        'Modern template to showcase mobile applications and app development skills',
      category: 'Mobile Apps',
      categoryIcon: Smartphone,
      price: 95,
      originalPrice: 119,
      image: '/api/placeholder/400/300',
      previewUrl: '#',
      rating: 4.9,
      reviews: 127,
      downloads: 2156,
      likes: 1234,
      author: { name: 'David Kim', avatar: '/api/placeholder/32/32', verified: true },
      tags: ['React Native', 'Flutter', 'App Store', 'Screenshots'],
      features: ['App Preview', 'Download Links', 'Features List', 'Reviews'],
      isNew: true,
      isTrending: true,
      isFeatured: true,
      isPopular: false,
      discount: 20,
      createdAt: '2024-08-01',
      lastUpdated: '2024-08-18',
    },
    {
      id: 5,
      title: 'Agency Landing Page',
      description: 'Professional template for digital agencies and marketing companies',
      category: 'Web Development',
      categoryIcon: Code,
      price: 109,
      originalPrice: 149,
      image: '/api/placeholder/400/300',
      previewUrl: '#',
      rating: 4.6,
      reviews: 178,
      downloads: 2890,
      likes: 1567,
      author: { name: 'Emily Davis', avatar: '/api/placeholder/32/32', verified: true },
      tags: ['Landing Page', 'CRM', 'Analytics', 'Multi-page'],
      features: ['Team Section', 'Case Studies', 'Testimonials', 'Contact'],
      isNew: false,
      isTrending: true,
      isFeatured: true,
      isPopular: true,
      discount: 27,
      createdAt: '2024-05-20',
      lastUpdated: '2024-08-12',
    },
    {
      id: 6,
      title: 'Minimalist Portfolio',
      description:
        'Clean and simple portfolio template focusing on content and usability',
      category: 'UI/UX Design',
      categoryIcon: Palette,
      price: 59,
      originalPrice: 79,
      image: '/api/placeholder/400/300',
      previewUrl: '#',
      rating: 4.8,
      reviews: 94,
      downloads: 1432,
      likes: 743,
      author: { name: 'James Wilson', avatar: '/api/placeholder/32/32', verified: false },
      tags: ['Minimalist', 'Typography', 'Grid Layout', 'White Space'],
      features: ['Clean Design', 'Fast Loading', 'Typography Focus', 'Simple'],
      isNew: true,
      isTrending: false,
      isFeatured: false,
      isPopular: true,
      discount: 25,
      createdAt: '2024-07-30',
      lastUpdated: '2024-08-19',
    },
  ]

  // Count for each tab (để badge của từng tab hiển thị đúng)
  const tabCounts: Record<TabId, number> = {
    featured: portfolios.filter((p) => p.isFeatured).length,
    trending: portfolios.filter((p) => p.isTrending).length,
    new: portfolios.filter((p) => p.isNew).length,
    popular: portfolios.filter((p) => p.isPopular).length,
  }

  const filteredPortfolios = portfolios.filter((p) => {
    switch (activeTab) {
      case 'featured':
        return p.isFeatured
      case 'trending':
        return p.isTrending
      case 'new':
        return p.isNew
      case 'popular':
        return p.isPopular
      default:
        return true
    }
  })

  const itemsPerPage = 3
  const totalPages = Math.ceil(filteredPortfolios.length / itemsPerPage)
  const currentPortfolios = filteredPortfolios.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  )

  // Easing dạng cubic-bezier để tránh lỗi type ("ease" string)
  const EASE_OUT: [number, number, number, number] = [0.33, 1, 0.68, 1]

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
  }

  const formatNumber = (num: number) => (num >= 1000 ? (num / 1000).toFixed(1) + 'k' : String(num))

  const getTimeSince = (date: string) => {
    const now = new Date()
    const createdDate = new Date(date)
    const diffInDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
    if (diffInDays <= 0) return 'hôm nay'
    if (diffInDays < 7) return `${diffInDays} ngày trước`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} tuần trước`
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} tháng trước`
    return `${Math.floor(diffInDays / 365)} năm trước`
  }

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-600/5 to-pink-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-gradient-to-r from-violet-600/5 to-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8B5CF6_1px,transparent_1px),linear-gradient(to_bottom,#8B5CF6_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-[0.02]" />
      </div>

      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="space-y-12"
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center space-y-6">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-violet-600/10 to-purple-600/10 border border-violet-500/20 rounded-full">
              <Award className="h-4 w-4 text-violet-400" />
              <span className="text-sm text-violet-300 font-medium">Portfolio chất lượng cao</span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold">
              <span className="block bg-gradient-to-r from-slate-200 via-white to-slate-300 bg-clip-text text-transparent">
                Portfolio được
              </span>
              <span className="block bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                yêu thích nhất
              </span>
            </h2>

            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Khám phá những template portfolio được đánh giá cao nhất, được thiết kế bởi các
              chuyên gia và được cộng đồng tin dùng
            </p>
          </motion.div>

          {/* Filter Tabs */}
          <motion.div variants={itemVariants} className="flex justify-center">
            <div className="relative bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-violet-500/20 p-2">
              <div className="flex flex-wrap justify-center gap-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id)
                      setCurrentPage(0)
                    }}
                    className={`relative px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'text-white bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 shadow-lg'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <tab.icon className="h-4 w-4" />
                      <span>{tab.name}</span>
                      <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                        {tabCounts[tab.id]}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Portfolio Grid */}
          <motion.div variants={containerVariants} className="space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab + currentPage}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE_OUT } }}
                exit={{ opacity: 0, y: -20, transition: { duration: 0.2, ease: EASE_OUT } }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                {currentPortfolios.map((portfolio, index) => (
                  <motion.div
                    key={portfolio.id}
                    variants={itemVariants}
                    onHoverStart={() => setHoveredCard(index)}
                    onHoverEnd={() => setHoveredCard(null)}
                    whileHover={{ y: -10 }}
                    className={`relative group ${
                      hoveredCard === index ? 'ring-1 ring-violet-400/30' : ''
                    }`}
                  >
                    {/* Card Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-purple-600/5 to-pink-600/5 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />

                    <div className="relative bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-violet-500/20 group-hover:border-violet-400/40 overflow-hidden transition-all duration-300">
                      {/* Image Section */}
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${
                            portfolio.category === 'UI/UX Design'
                              ? 'from-purple-600/20 via-pink-600/20 to-violet-600/20'
                              : portfolio.category === 'Web Development'
                              ? 'from-blue-600/20 via-cyan-600/20 to-indigo-600/20'
                              : portfolio.category === 'Photography'
                              ? 'from-emerald-600/20 via-teal-600/20 to-green-600/20'
                              : portfolio.category === 'Mobile Apps'
                              ? 'from-orange-600/20 via-red-600/20 to-pink-600/20'
                              : 'from-violet-600/20 via-purple-600/20 to-pink-600/20'
                          }`}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <portfolio.categoryIcon className="h-16 w-16 text-slate-600" />
                        </div>

                        {/* Badges */}
                        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                          {portfolio.isNew && (
                            <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-medium rounded-full flex items-center space-x-1">
                              <Star className="h-3 w-3" />
                              <span>Mới</span>
                            </span>
                          )}
                          {portfolio.isTrending && (
                            <span className="px-3 py-1 bg-orange-500 text-white text-xs font-medium rounded-full flex items-center space-x-1">
                              <TrendingUp className="h-3 w-3" />
                              <span>Hot</span>
                            </span>
                          )}
                          {portfolio.discount > 20 && (
                            <span className="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                              -{portfolio.discount}%
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 bg-black/50 backdrop-blur-sm text-white rounded-full hover:bg-black/70 transition-colors"
                          >
                            <Heart className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 bg-black/50 backdrop-blur-sm text-white rounded-full hover:bg-black/70 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </motion.button>
                        </div>

                        {/* Preview Button */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Link
                            href={portfolio.previewUrl}
                            className="flex items-center space-x-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-medium rounded-xl border border-white/20 hover:bg-white/20 transition-colors group/btn"
                          >
                            <Play className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                            <span>Xem demo</span>
                          </Link>
                        </div>

                        {/* Last Updated */}
                        <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="flex items-center space-x-2 px-3 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded-full">
                            <Clock className="h-3 w-3" />
                            <span>Cập nhật {getTimeSince(portfolio.lastUpdated)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-6 space-y-4">
                        {/* Category & Price */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <portfolio.categoryIcon className="h-4 w-4 text-violet-400" />
                            <span className="text-sm text-violet-300 font-medium">
                              {portfolio.category}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-white">${portfolio.price}</span>
                            {portfolio.originalPrice > portfolio.price && (
                              <span className="text-sm text-slate-400 line-through">
                                ${portfolio.originalPrice}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Title & Description */}
                        <div className="space-y-2">
                          <h3 className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-violet-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300">
                            {portfolio.title}
                          </h3>
                          <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">
                            {portfolio.description}
                          </p>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                          {portfolio.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-slate-800/50 text-slate-300 text-xs rounded-full border border-slate-600/30 hover:border-violet-500/50 transition-colors"
                            >
                              {tag}
                            </span>
                          ))}
                          {portfolio.tags.length > 3 && (
                            <span className="px-3 py-1 bg-slate-800/50 text-slate-400 text-xs rounded-full border border-slate-600/30">
                              +{portfolio.tags.length - 3}
                            </span>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 text-sm text-slate-400">
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="font-medium">{portfolio.rating}</span>
                            <span>({portfolio.reviews})</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Download className="h-4 w-4 text-blue-400" />
                            <span>{formatNumber(portfolio.downloads)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Heart className="h-4 w-4 text-red-400" />
                            <span>{formatNumber(portfolio.likes)}</span>
                          </div>
                        </div>

                        {/* Author & Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-semibold">
                                {portfolio.author.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white flex items-center space-x-1">
                                <span>{portfolio.author.name}</span>
                                {portfolio.author.verified && (
                                  <CheckCircle className="w-4 h-4 text-blue-400" />
                                )}
                              </p>
                              <p className="text-xs text-slate-400">
                                Tạo {getTimeSince(portfolio.createdAt)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white rounded-lg border border-slate-600/30 hover:border-violet-500/50 transition-all duration-300"
                            >
                              <ShoppingCart className="h-4 w-4" />
                            </motion.button>

                            <Link
                              href={`/portfolio/${portfolio.id}`}
                              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300 group/btn"
                            >
                              <span>Mua ngay</span>
                              <ExternalLink className="h-4 w-4 group-hover/btn:translate-x-0.5 transition-transform" />
                            </Link>
                          </div>
                        </div>
                      </div>

                      {/* Hover Glow Effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-purple-600/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl pointer-events-none" />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div variants={itemVariants} className="flex items-center justify-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="p-3 bg-slate-800/50 text-slate-400 rounded-xl border border-slate-600/30 hover:text-white hover:border-violet-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  <ArrowLeft className="h-5 w-5" />
                </motion.button>

                <div className="flex items-center space-x-2">
                  {Array.from({ length: totalPages }).map((_, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setCurrentPage(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        currentPage === index
                          ? 'bg-gradient-to-r from-violet-500 to-purple-500 scale-125'
                          : 'bg-slate-600 hover:bg-slate-500'
                      }`}
                    />
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="p-3 bg-slate-800/50 text-slate-400 rounded-xl border border-slate-600/30 hover:text-white hover:border-violet-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  <ArrowRight className="h-5 w-5" />
                </motion.button>
              </motion.div>
            )}
          </motion.div>

          {/* Bottom CTA */}
          <motion.div variants={itemVariants} className="text-center space-y-6">
            <div className="inline-flex items-center space-x-4 px-6 py-3 bg-slate-800/30 border border-slate-600/30 rounded-2xl backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-violet-400" />
                <span className="text-slate-300">Được yêu thích bởi 250,000+ designers</span>
              </div>
              <div className="w-px h-6 bg-slate-600" />
              <div className="flex items-center space-x-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
                <span className="text-slate-400 ml-2">4.9/5 từ 5,000+ reviews</span>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-lg text-slate-400">Muốn xem thêm portfolio tuyệt vời?</p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/portfolios"
                  className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white font-semibold rounded-2xl hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300 group"
                >
                  <span>Xem tất cả portfolio</span>
                  <ExternalLink className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
