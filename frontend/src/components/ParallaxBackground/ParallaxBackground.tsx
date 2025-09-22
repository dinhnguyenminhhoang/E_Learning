'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import dynamic from 'next/dynamic'

const MysticBackground = dynamic(
  () => import('@/components/MysticBackground/MysticBackground'),
  { ssr: false }
)

export default function ParallaxBackground() {
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])

  return (
    <motion.div
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ y, willChange: 'transform' }}
    >
      <MysticBackground />
    </motion.div>
  )
}
