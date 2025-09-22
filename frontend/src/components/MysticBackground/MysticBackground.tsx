'use client'
import { useEffect, useState } from 'react'

type Star = {
  left: string
  top: string
  size: string
  color: string
  delay: string
  duration: string
}
type Particle = {
  left: string
  top: string
  w: string
  h: string
  delay: string
  duration: string
}
type Flow = {
  left: string
  top: string
  rotate: string
  delay: string
  duration: string
}

export default function MysticBackground() {
  const [stars, setStars] = useState<Star[]>([])
  const [particles, setParticles] = useState<Particle[]>([])
  const [flows, setFlows] = useState<Flow[]>([])

  useEffect(() => {
    // chạy 1 lần trên client
    const rand = Math.random // đủ dùng; bạn cũng có thể dùng seeded PRNG nếu muốn ổn định giữa reload có seed

    const colorPool = ['#e0e7ff', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1']

    const s: Star[] = Array.from({ length: 200 }, () => ({
      left: `${rand() * 100}%`,
      top: `${rand() * 100}%`,
      size: `${rand() * 2 + 0.5}px`,
      color: colorPool[Math.floor(rand() * colorPool.length)],
      delay: `${rand() * 8}s`,
      duration: `${4 + rand() * 8}s`,
    }))

    const p: Particle[] = Array.from({ length: 25 }, () => ({
      left: `${rand() * 100}%`,
      top: `${rand() * 100}%`,
      w: `${rand() * 6 + 2}px`,
      h: `${rand() * 6 + 2}px`,
      delay: `${rand() * 10}s`,
      duration: `${12 + rand() * 16}s`,
    }))

    const f: Flow[] = Array.from({ length: 4 }, (_, i) => ({
      left: `${rand() * 100}%`,
      top: `${rand() * 60}%`,
      rotate: `rotate(${-20 + rand() * 40}deg)`,
      delay: `${i * 6 + rand() * 4}s`,
      duration: `3s`,
    }))

    setStars(s)
    setParticles(p)
    setFlows(f)
  }, [])

  return (
    <div className="absolute inset-0">
      {/* Deep space gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-violet-900/20" />

      {/* Mystic stars field */}
      <div className="absolute inset-0 opacity-70">
        {stars.map((st, i) => (
          <div
            key={i}
            className="animate-mystic-twinkle absolute rounded-full"
            style={{
              left: st.left,
              top: st.top,
              width: st.size,
              height: st.size,
              backgroundColor: st.color,
              animationDelay: st.delay,
              animationDuration: st.duration,
            }}
          />
        ))}
      </div>

      {/* Mystical aurora clouds */}
      <div className="bg-gradient-radial animate-mystic-pulse absolute top-0 left-0 h-96 w-96 rounded-full from-violet-600/15 via-indigo-700/8 to-transparent blur-3xl" />
      <div className="bg-gradient-radial animate-mystic-pulse-delayed absolute right-0 bottom-0 h-80 w-80 rounded-full from-indigo-600/15 via-violet-800/8 to-transparent blur-3xl" />
      <div className="bg-gradient-radial animate-mystic-float absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full from-purple-600/10 via-indigo-900/5 to-transparent blur-2xl" />

      {/* Mystical particles */}
      <div className="absolute inset-0">
        {particles.map((pt, i) => (
          <div
            key={i}
            className="animate-mystic-drift absolute rounded-full bg-gradient-to-r from-violet-400/20 to-indigo-400/10"
            style={{
              left: pt.left,
              top: pt.top,
              width: pt.w,
              height: pt.h,
              animationDelay: pt.delay,
              animationDuration: pt.duration,
            }}
          />
        ))}
      </div>

      {/* Mystical flowing energy */}
      <div className="absolute inset-0">
        {flows.map((fl, i) => (
          <div
            key={i}
            className="animate-mystic-flow absolute h-0.5 w-20 bg-gradient-to-r from-transparent via-violet-400/40 to-transparent opacity-0"
            style={{
              left: fl.left,
              top: fl.top,
              animationDelay: fl.delay,
              animationDuration: fl.duration,
              transform: fl.rotate,
            }}
          />
        ))}
      </div>
    </div>
  )
}
