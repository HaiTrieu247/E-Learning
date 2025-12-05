"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Course } from '@/src/types/course'
import { courseService } from '@/src/services/courseService'
import { BookOpen, ChevronLeft, ChevronRight, Clock, Users, Star, ArrowRight, Sparkles, GraduationCap, Award, TrendingUp } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)

  // Hero carousel slides
  const heroSlides = [
    {
      title: "Transform Your Future",
      subtitle: "Learn from industry experts and master in-demand skills",
      description: "Join thousands of learners advancing their careers with our comprehensive courses",
      bgGradient: "from-indigo-600 via-purple-600 to-pink-600",
      icon: <GraduationCap className="w-20 h-20" />
    },
    {
      title: "Expert-Led Courses",
      subtitle: "Learn at your own pace with lifetime access",
      description: "Get certified and boost your career with our interactive learning platform",
      bgGradient: "from-blue-600 via-cyan-600 to-teal-600",
      icon: <Award className="w-20 h-20" />
    },
    {
      title: "Build Real Projects",
      subtitle: "Hands-on learning with practical assignments",
      description: "Apply your knowledge immediately with real-world projects and exercises",
      bgGradient: "from-violet-600 via-fuchsia-600 to-rose-600",
      icon: <Sparkles className="w-20 h-20" />
    }
  ]

  useEffect(() => {
    // Fetch featured courses (top 6)
    courseService.getAllCourses()
      .then((data) => {
        setFeaturedCourses(data.slice(0, 6))
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching courses:', error)
        setLoading(false)
      })
  }, [])

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(timer)
  }, [heroSlides.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Carousel Section */}
      <div className="relative h-[600px] overflow-hidden">
        {/* Slides */}
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === currentSlide 
                ? 'opacity-100 translate-x-0' 
                : index < currentSlide 
                ? 'opacity-0 -translate-x-full' 
                : 'opacity-0 translate-x-full'
            }`}
          >
            <div className={`h-full bg-gradient-to-r ${slide.bgGradient} flex items-center justify-center relative overflow-hidden`}>
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 -left-4 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-xl animate-blob"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-xl animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-xl animate-blob animation-delay-4000"></div>
              </div>

              <div className="max-w-7xl mx-auto px-8 py-20 relative z-10">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  {/* Text Content */}
                  <div className="text-white space-y-6 animate-fade-in">
                    <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-4">
                      🚀 Start Learning Today
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                      {slide.title}
                    </h1>
                    <p className="text-2xl font-semibold text-white/90">
                      {slide.subtitle}
                    </p>
                    <p className="text-lg text-white/80 max-w-xl">
                      {slide.description}
                    </p>
                    <div className="flex gap-4 pt-4">
                      <button 
                        onClick={() => router.push('/courses')}
                        className="px-8 py-4 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        Explore Courses
                        <ArrowRight className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => router.push('/register')}
                        className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white rounded-lg font-semibold hover:bg-white/20 transition-all duration-200"
                      >
                        Get Started
                      </button>
                    </div>
                  </div>

                  {/* Icon/Illustration */}
                  <div className="hidden md:flex justify-center items-center animate-float">
                    <div className="relative">
                      <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl"></div>
                      <div className="relative text-white/90">
                        {slide.icon}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button 
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-all duration-200 z-20 group"
        >
          <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
        <button 
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-all duration-200 z-20 group"
        >
          <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentSlide 
                  ? 'w-12 h-3 bg-white' 
                  : 'w-3 h-3 bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { icon: <BookOpen className="w-8 h-8" />, value: "10K+", label: "Active Courses", color: "from-blue-500 to-cyan-500" },
            { icon: <Users className="w-8 h-8" />, value: "50K+", label: "Students Enrolled", color: "from-purple-500 to-pink-500" },
            { icon: <GraduationCap className="w-8 h-8" />, value: "500+", label: "Expert Instructors", color: "from-green-500 to-emerald-500" },
            { icon: <Award className="w-8 h-8" />, value: "95%", label: "Success Rate", color: "from-orange-500 to-red-500" }
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center text-white mb-4 shadow-lg`}>
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</div>
              <div className="text-gray-600 text-sm font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Courses Section */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
              <Star className="w-10 h-10 text-yellow-500 fill-yellow-500" />
              Featured Courses
            </h2>
            <p className="text-gray-600 text-lg">Handpicked courses to boost your career</p>
          </div>
          <button 
            onClick={() => router.push('/courses')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            View All Courses
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCourses.map((course) => (
              <Link
                key={course.courseID}
                href={`/courses/${course.courseID}?courseID=${course.courseID}`}
                className="block bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-2 group"
              >
                {/* Course Image/Gradient */}
                <div className="h-48 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all duration-300"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="inline-block px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-indigo-600">
                      <TrendingUp className="w-3 h-3 inline mr-1" />
                      Featured
                    </div>
                  </div>
                </div>

                {/* Course Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {course.courseTitle}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {course.courseDescription}
                  </p>

                  {/* Course Meta */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>12 modules</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>8h 30m</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-yellow-500" />
                      <span className="text-sm font-semibold text-gray-700">4.8</span>
                    </div>
                  </div>

                  {/* Enroll Button */}
                  <button className="w-full mt-4 px-4 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all duration-200 flex items-center justify-center gap-2 group-hover:shadow-lg">
                    View Course
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Call to Action Section */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl overflow-hidden relative">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
          </div>
          
          <div className="relative z-10 px-12 py-20 text-center text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to Start Learning?</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join our community of learners and transform your career with industry-leading courses
            </p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => router.push('/register')}
                className="px-8 py-4 bg-white text-indigo-600 rounded-lg font-bold hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Sign Up for Free
              </button>
              <button 
                onClick={() => router.push('/courses')}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white rounded-lg font-bold hover:bg-white/20 transition-all duration-200"
              >
                Browse Courses
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

