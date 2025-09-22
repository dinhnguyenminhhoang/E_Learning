"use client"

import { useEffect, useState } from "react"
import { motion } from 'framer-motion'
import { Button } from "../ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function Carousel({ children, className = "" }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(1)

  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth >= 1024) setItemsPerView(4)
      else if (window.innerWidth >= 768) setItemsPerView(3)
      else if (window.innerWidth >= 640) setItemsPerView(2)
      else setItemsPerView(1)
    }

    updateItemsPerView()
    window.addEventListener('resize', updateItemsPerView)
    return () => window.removeEventListener('resize', updateItemsPerView)
  }, [])

  const totalItems = children.length
  const maxIndex = Math.max(0, totalItems - itemsPerView)

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }

  return (
    <div className={`relative ${className}`}>
      <div className="overflow-hidden">
        <motion.div
          className="flex"
          animate={{
            x: `-${(currentIndex * 100) / itemsPerView}%`,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {children.map((child, index) => (
            <div
              key={index}
              className={`flex-shrink-0 px-2`}
              style={{ width: `${100 / itemsPerView}%` }}
            >
              {child}
            </div>
          ))}
        </motion.div>
      </div>

      {maxIndex > 0 && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 h-10 w-10 rounded-full border-white/20 bg-slate-900/80 backdrop-blur-sm hover:bg-slate-800/90 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={nextSlide}
            disabled={currentIndex === maxIndex}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 h-10 w-10 rounded-full border-white/20 bg-slate-900/80 backdrop-blur-sm hover:bg-slate-800/90 disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {maxIndex > 0 && (
        <div className="flex justify-center mt-4 gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex 
                  ? 'bg-gradient-to-r from-sky-400 to-emerald-400 w-6' 
                  : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
