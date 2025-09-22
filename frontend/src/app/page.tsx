"use client"
import dynamic from 'next/dynamic'
import { Suspense } from 'react'


import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import ParallaxBackground from '@/components/ParallaxBackground/ParallaxBackground'

const HeroSection = dynamic(() => import('@/components/home/HeroSection'), {
  ssr: true,
  loading: () => <SectionFallback height="min-h-[70vh]" />
})
const CategorySection = dynamic(() => import('@/components/home/CategorySection'), {
  ssr: true,
  loading: () => <SectionFallback />
})
const FeaturedPortfolios = dynamic(() => import('@/components/home/FeaturedPortfolios'), {
  ssr: true,
  loading: () => <SectionFallback />
})
const StatsSection = dynamic(() => import('@/components/home/StatsSection'), {
  ssr: true,
  loading: () => <SectionFallback />
})
const TestimonialsSection = dynamic(() => import('@/components/home/TestimonialsSection'), {
  ssr: true,
  loading: () => <SectionFallback />
})
const CTASection = dynamic(() => import('@/components/home/CTASection'), {
  ssr: true,
  loading: () => <SectionFallback />
})

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      <ParallaxBackground />

      <div className="relative z-10">
        <Header />

        <Suspense fallback={<SectionFallback height="min-h-[70vh]" />}>
          <HeroSection />
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <CategorySection />
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <FeaturedPortfolios />
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <StatsSection />
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <TestimonialsSection />
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <CTASection />
        </Suspense>

        <Footer />
      </div>
    </div>
  )
}

function SectionFallback({ height = 'min-h-[50vh]' }: { height?: string }) {
  return (
    <section className={`relative ${height} py-12 px-4 sm:px-6 lg:px-8 z-50`}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/6 w-64 h-64 bg-gradient-to-r from-pink-600/10 to-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/6 w-72 h-72 bg-gradient-to-r from-violet-600/10 to-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8B5CF6_1px,transparent_1px),linear-gradient(to_bottom,#8B5CF6_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-[0.03]" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-56 bg-slate-800/50 rounded-lg" />
          <div className="h-6 w-96 bg-slate-800/40 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-40 bg-slate-800/30 rounded-2xl border border-slate-700/40" />
            <div className="h-40 bg-slate-800/30 rounded-2xl border border-slate-700/40" />
            <div className="h-40 bg-slate-800/30 rounded-2xl border border-slate-700/40" />
          </div>
        </div>
      </div>
    </section>
  )
}
