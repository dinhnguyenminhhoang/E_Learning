'use client'

import { authService } from '@/services/auth.service'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Bell,
  LogOut,
  Menu,
  Search,
  Settings,
  Sparkles,
  User,
  X,
  GraduationCap,
  BookOpen,
  Headphones,
  Mic,
  Target,
  Trophy,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const BRAND = 'E_LEANING'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated())
  }, [])

  const navigation = [
    { name: 'Trang chủ', href: '/', active: true },
    { name: 'Khóa học', href: '/courses' },
    { name: 'Quiz', href: '/quiz' },
    { name: 'Xếp lớp', href: '/placement' },
    { name: 'Phát âm', href: '/practice/pronunciation' },
    { name: 'Về chúng tôi', href: '/about' },
  ]

  const userMenuItems = [
    { name: 'Hồ sơ của tôi', href: '/profile', icon: User },
    { name: 'Tiến độ học tập', href: '/progress', icon: Trophy },
    { name: 'Cài đặt', href: '/settings', icon: Settings },
    { name: 'Đăng xuất', href: '/logout', icon: LogOut },
  ]

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? 'bg-slate-900/80 backdrop-blur-xl border-b border-teal-500/20 shadow-lg shadow-sky-500/10'
          : 'bg-transparent'
        }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between lg:h-20">
          {/* Logo */}
          <motion.div
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 blur opacity-50" />
              </div>
              <div className="hidden sm:block">
                <h1 className="bg-gradient-to-r from-sky-200 via-teal-200 to-emerald-200 bg-clip-text text-xl font-bold text-transparent">
                  {BRAND}
                </h1>
                <p className="text-xs text-teal-200/70">Học tiếng Anh thông minh</p>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden items-center space-x-1 lg:flex">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${item.active
                    ? 'border border-teal-400/40 bg-sky-900/40 text-sky-200'
                    : 'text-teal-100/85 hover:bg-slate-800/50 hover:text-teal-50'
                  }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="mx-8 hidden max-w-md flex-1 items-center md:flex">
            <div className="relative w-full">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-teal-300/70" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-teal-500/30 bg-sky-950/40 py-2.5 pl-10 pr-4 text-teal-100 placeholder-teal-300/60 outline-none transition-all duration-200 focus:border-teal-400/60 focus:ring-2 focus:ring-teal-500/30"
                placeholder="Tìm khóa học, bài quiz, kỹ năng..."
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  <X className="h-4 w-4 text-teal-300/70 hover:text-teal-200" />
                </button>
              )}
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden items-center space-x-4 lg:flex">
            {isAuthenticated ? (
              <>
                {/* Quick links to core features */}
                <Link
                  href="/courses"
                  className="hidden items-center gap-2 rounded-xl border border-teal-400/40 bg-sky-900/30 px-3 py-2 text-sm text-teal-100/90 hover:bg-sky-900/50 md:flex"
                >
                  <BookOpen className="h-4 w-4" />
                  Khóa học
                </Link>
                <Link
                  href="/practice/pronunciation"
                  className="hidden items-center gap-2 rounded-xl border border-teal-400/40 bg-sky-900/30 px-3 py-2 text-sm text-teal-100/90 hover:bg-sky-900/50 md:flex"
                >
                  <Mic className="h-4 w-4" />
                  Phát âm
                </Link>

                {/* Notifications */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="relative p-2 text-teal-200/80 transition-colors hover:text-white"
                >
                  <Bell className="h-6 w-6" />
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-sky-400" />
                </motion.button>

                {/* User Menu */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsUserMenuOpen((v) => !v)}
                    className="flex items-center space-x-3 rounded-xl border border-teal-500/30 bg-sky-950/40 p-2 transition-all duration-200 hover:border-teal-400/60"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-sky-600 to-emerald-600">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="hidden text-sm text-teal-100/90 xl:block">
                      Người dùng
                    </span>
                  </motion.button>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-teal-500/30 bg-slate-900/90 backdrop-blur-xl shadow-xl shadow-sky-500/10"
                      >
                        <div className="border-b border-teal-500/20 p-4">
                          <div className="flex items-center space-x-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-sky-600 to-emerald-600">
                              <GraduationCap className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">Người dùng</p>
                              <p className="text-xs text-teal-300/80">user@example.com</p>
                            </div>
                          </div>
                        </div>
                        <div className="py-2">
                          {userMenuItems.map((item) => (
                            <Link
                              key={item.name}
                              href={item.href}
                              className="flex items-center space-x-3 px-4 py-3 text-sm text-teal-100/90 transition-colors hover:bg-sky-900/50 hover:text-teal-50"
                            >
                              <item.icon className="h-4 w-4" />
                              <span>{item.name}</span>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/signin"
                  className="px-4 py-2 text-sm font-medium text-teal-100/90 transition-colors hover:text-white"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/signup"
                  className="rounded-xl bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 px-6 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:shadow-lg hover:shadow-sky-500/25"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Right */}
          <div className="flex items-center space-x-3 lg:hidden">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-teal-200/80 transition-colors hover:text-white md:hidden"
            >
              <Search className="h-6 w-6" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              className="p-2 text-teal-200/80 transition-colors hover:text-white"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-teal-500/20 bg-slate-900/95 backdrop-blur-xl"
          >
            <div className="space-y-4 px-4 py-6">
              {/* Mobile Quick CTA row */}
              <div className="grid grid-cols-3 gap-2">
                <Link
                  href="/courses"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-teal-400/40 bg-sky-900/40 px-3 py-2 text-sm text-teal-100/90"
                >
                  <BookOpen className="h-4 w-4" /> Khóa học
                </Link>
                <Link
                  href="/placement"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-teal-400/40 bg-sky-900/40 px-3 py-2 text-sm text-teal-100/90"
                >
                  <Target className="h-4 w-4" /> Xếp lớp
                </Link>
                <Link
                  href="/practice/pronunciation"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-teal-400/40 bg-sky-900/40 px-3 py-2 text-sm text-teal-100/90"
                >
                  <Mic className="h-4 w-4" /> Phát âm
                </Link>
              </div>

              {/* Mobile Search */}
              <div className="relative md:hidden">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-5 w-5 text-teal-300/70" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-teal-500/30 bg-sky-950/40 py-3 pl-10 pr-4 text-teal-100 placeholder-teal-300/60 outline-none focus:border-teal-400/60 focus:ring-2 focus:ring-teal-500/30"
                  placeholder="Tìm khóa học, bài quiz, kỹ năng..."
                />
              </div>

              {/* Mobile Navigation */}
              <nav className="space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`block rounded-xl px-4 py-3 text-base font-medium transition-all duration-200 ${item.active
                        ? 'border border-teal-400/40 bg-sky-900/40 text-sky-200'
                        : 'text-teal-100/85 hover:bg-slate-800/50 hover:text-teal-50'
                      }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              {/* Mobile Actions */}
              {isAuthenticated ? (
                <div className="space-y-2 border-t border-teal-500/20 pt-4">
                  {userMenuItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center space-x-3 rounded-xl px-4 py-3 text-teal-100/90 transition-colors hover:bg-sky-900/50 hover:text-teal-50"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 border-t border-teal-500/20 pt-4">
                  <Link
                    href="/signin"
                    className="block w-full rounded-xl px-4 py-3 text-center text-teal-100/90 transition-colors hover:bg-slate-800/50 hover:text-teal-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/signup"
                    className="block w-full rounded-xl bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 px-4 py-3 text-center font-medium text-white transition-all duration-200 hover:shadow-lg hover:shadow-sky-500/25"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Đăng ký ngay
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
