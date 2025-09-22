'use client'

import { motion, type Variants } from 'framer-motion'
import { ArrowLeft, ArrowRight, Quote, Star, Users } from 'lucide-react'
import { useState } from 'react'
import { useInView } from 'react-intersection-observer'

function TestimonialsSection() {
  const [ref, inView] = useInView({ threshold: 0.2, triggerOnce: true })
  const [currentIndex, setCurrentIndex] = useState(0)

  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Senior UI/UX Designer',
      company: 'Google',
      avatar: '/api/placeholder/64/64',
      rating: 5,
      content:
        'Portfolio Marketplace đã thay đổi hoàn toàn cách tôi showcase công việc của mình. Template chất lượng cao và dễ customize, giúp tôi tiết kiệm hàng tuần thời gian.',
      featured: true
    },
    {
      id: 2,
      name: 'Alex Chen',
      role: 'Full-Stack Developer',
      company: 'Microsoft',
      avatar: '/api/placeholder/64/64',
      rating: 5,
      content:
        'Tôi đã thử nhiều platform khác nhưng không có nơi nào có collection template phong phú và chất lượng như đây. Definitely worth every penny!',
      featured: true
    },
    {
      id: 3,
      name: 'Maria Rodriguez',
      role: 'Creative Director',
      company: 'Adobe',
      avatar: '/api/placeholder/64/64',
      rating: 5,
      content:
        'Customer support tuyệt vời, templates always up-to-date với latest trends. Đây là investment tốt nhất cho career của tôi.',
      featured: false
    },
    {
      id: 4,
      name: 'David Kim',
      role: 'Freelance Designer',
      company: 'Independent',
      avatar: '/api/placeholder/64/64',
      rating: 5,
      content:
        'Từ khi dùng templates từ đây, số lượng clients của tôi tăng 300%. Professional appearance thực sự make a difference!',
      featured: true
    }
  ]

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  // Use cubic-bezier tuple to satisfy framer-motion's Easing type (avoid string like "easeOut")
  const EASE_OUT: [number, number, number, number] = [0.33, 1, 0.68, 1]

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: EASE_OUT }
    }
  }

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/6 w-80 h-80 bg-gradient-to-r from-pink-600/5 to-purple-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/6 w-96 h-96 bg-gradient-to-r from-violet-600/5 to-blue-600/5 rounded-full blur-3xl" />
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
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-600/10 to-teal-600/10 border border-emerald-500/20 rounded-full">
              <Users className="h-4 w-4 text-emerald-400" />
              <span className="text-sm text-emerald-300 font-medium">Phản hồi khách hàng</span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold">
              <span className="block bg-gradient-to-r from-slate-200 via-white to-slate-300 bg-clip-text text-transparent">
                Khách hàng nói gì
              </span>
              <span className="block bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                về chúng tôi
              </span>
            </h2>

            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Hàng ngàn khách hàng trên toàn thế giới đã tin tưởng và đạt được thành công với Portfolio
              Marketplace
            </p>
          </motion.div>

          {/* Main Testimonial */}
          <motion.div variants={itemVariants} className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 via-purple-600/5 to-pink-600/5 rounded-3xl blur-xl" />

            <div className="relative bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-violet-500/20 p-8 md:p-12">
              <div className="relative">
                {/* Quote Icon */}
                <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
                  <Quote className="h-8 w-8 text-white" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-center">
                  {/* Testimonial Content */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center space-x-1 mb-4">
                      {Array.from({ length: testimonials[currentIndex].rating }).map((_, i) => (
                        <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                      ))}
                    </div>

                    <blockquote className="text-xl md:text-2xl text-slate-200 leading-relaxed font-medium">
                      “{testimonials[currentIndex].content}”
                    </blockquote>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {testimonials[currentIndex].name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-white">{testimonials[currentIndex].name}</p>
                          <p className="text-slate-400">
                            {testimonials[currentIndex].role} at {testimonials[currentIndex].company}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="lg:col-span-1 space-y-6">
                    <div className="flex justify-center lg:justify-end space-x-4">
                      <button
                        onClick={prevTestimonial}
                        className="p-3 bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white rounded-xl border border-slate-600/30 hover:border-violet-500/50 transition-all duration-300"
                        aria-label="Previous testimonial"
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={nextTestimonial}
                        className="p-3 bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white rounded-xl border border-slate-600/30 hover:border-violet-500/50 transition-all duration-300"
                        aria-label="Next testimonial"
                      >
                        <ArrowRight className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Dots Indicator */}
                    <div className="flex justify-center lg:justify-end space-x-2">
                      {testimonials.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentIndex(index)}
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            currentIndex === index
                              ? 'bg-gradient-to-r from-violet-500 to-purple-500 scale-125'
                              : 'bg-slate-600 hover:bg-slate-500'
                          }`}
                          aria-label={`Go to testimonial ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Additional Testimonials Grid */}
          <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials
              .filter((_, index) => index !== currentIndex)
              .slice(0, 3)
              .map((testimonial) => (
                <motion.div
                  key={testimonial.id}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  className="relative group cursor-pointer"
                  onClick={() => setCurrentIndex(testimonials.findIndex((t) => t.id === testimonial.id))}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-800/20 to-slate-900/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                  <div className="relative bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 group-hover:border-violet-500/30 p-6 transition-all duration-300">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                        ))}
                      </div>

                      <p className="text-slate-300 text-sm leading-relaxed line-clamp-3">“{testimonial.content}”</p>

                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-semibold">{testimonial.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{testimonial.name}</p>
                          <p className="text-xs text-slate-400">{testimonial.company}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
export default TestimonialsSection
