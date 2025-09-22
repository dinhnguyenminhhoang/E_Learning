'use client'

import { motion, type Variants } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useMemo } from 'react'

type LoadingSplashProps = {
  show?: boolean
  message?: string
}

const EASE_OUT: [number, number, number, number] = [0.33, 1, 0.68, 1]

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } }
}

function polarDot(i: number) {
  const golden = 137.508 // deg
  const angle = ((i * golden) % 360) * (Math.PI / 180)
  const r = 18 + ((i % 6) * 8) // radius
  const top = 50 + Math.sin(angle) * r
  const left = 50 + Math.cos(angle) * r
  const size = 2 + (i % 3) // 2..4 px
  return { top, left, size }
}

export default function LoadingSplash({ show = true, message = 'Đang tải...' }: LoadingSplashProps) {
  if (!show) return null

  const dots = useMemo(
    () => Array.from({ length: 24 }).map((_, i) => polarDot(i)),
    []
  )

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="fixed inset-0 z-[1000] flex items-center justify-center"
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-slate-950/95" />

      {/* soft gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-br from-violet-600/20 via-purple-600/15 to-pink-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-tr from-pink-600/20 via-violet-600/15 to-indigo-600/10 rounded-full blur-3xl" />
        {/* grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8B5CF6_1px,transparent_1px),linear-gradient(to_bottom,#8B5CF6_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-[0.03]" />
      </div>

      {/* floating dots */}
      <div className="absolute inset-0 pointer-events-none">
        {dots.map((d, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-violet-400 to-purple-400"
            style={{ top: `${d.top}%`, left: `${d.left}%`, width: d.size, height: d.size }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2 + (i % 5) * 0.2, repeat: Infinity, ease: EASE_OUT }}
          />
        ))}
      </div>

      {/* card */}
      <motion.div
        variants={containerVariants}
        className="relative mx-4 w-full max-w-md rounded-3xl border border-violet-500/20 bg-slate-900/50 p-8 text-center backdrop-blur-xl"
      >
        <motion.div
          variants={itemVariants}
          className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-violet-500/20"
        >
          <Sparkles className="h-7 w-7" />
        </motion.div>

        <motion.h3
          variants={itemVariants}
          className="mb-2 text-2xl font-bold bg-gradient-to-r from-violet-300 via-purple-300 to-pink-300 bg-clip-text text-transparent"
        >
          Portfolio Market
        </motion.h3>

        <motion.p variants={itemVariants} className="mb-6 text-slate-400">
          {message}
        </motion.p>

        {/* progress bar */}
        <motion.div variants={itemVariants} className="mx-auto h-2 w-56 overflow-hidden rounded-full bg-slate-800/60">
          <motion.div
            className="h-full w-1/3 rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: EASE_OUT }}
          />
        </motion.div>

        {/* subtle shine */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/5 to-transparent"
          animate={{ x: ['-120%', '120%'] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: EASE_OUT, delay: 0.2 }}
        />
      </motion.div>
    </motion.div>
  )
}
