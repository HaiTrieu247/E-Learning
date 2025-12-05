'use client'; 

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, BookOpen, Filter, X, Loader2, GraduationCap } from 'lucide-react';
import type { Course, CourseCategory } from '@/src/types/course';

export default function CoursesPage() {
  const router = useRouter();
  
  // State management
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sortType, setSortType] = useState<'default' | 'name-asc' | 'name-desc'>('default');

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [coursesRes, categoriesRes] = await Promise.all([
          fetch('/api/courses'),
          fetch('/api/categories')
        ]);
        
        if (coursesRes.ok && categoriesRes.ok) {
          const coursesData = await coursesRes.json();
          const categoriesData = await categoriesRes.json();
          
          setCourses(Array.isArray(coursesData) ? coursesData : []);
          setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        } else {
          console.error('API Error:', coursesRes.status, categoriesRes.status);
          setCourses([]);
          setCategories([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setCourses([]);
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and sort courses
  const filteredAndSortedCourses = courses
    .filter((course) => {
      const matchesSearch = course.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            course.courseDescription.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === null || course.categoryID === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortType === 'name-asc') {
        return a.courseTitle.localeCompare(b.courseTitle);
      }
      if (sortType === 'name-desc') {
        return b.courseTitle.localeCompare(a.courseTitle);
      }
      return 0; // default
    });

  // Handle course click
  const handleCourseClick = (courseID: number) => {
    router.push(`/courses/${courseID}?courseID=${courseID}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="flex">
        {/* Sidebar Overlay for mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed lg:sticky top-0 left-0 h-screen z-50
          glass border-r border-slate-200/50 shadow-smooth-lg
          transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isSidebarOpen ? 'w-64 lg:w-56' : 'w-0 lg:w-0'}
          overflow-hidden
        `}>
          <div className="p-4 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-6 animate-slide-down">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Filter size={18} className="text-indigo-600" />
                <span className="gradient-text">Categories</span>
              </h2>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-all duration-200 hover:scale-110"
              >
                <X size={18} />
              </button>
            </div>

            {/* All Courses */}
            <button
              onClick={() => {
                setSelectedCategory(null);
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-xl mb-2 transition-all duration-200 transform hover:scale-[1.02] ${
                selectedCategory === null
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-smooth-lg scale-[1.02]'
                  : 'bg-white hover:bg-slate-50 text-slate-700 shadow-smooth hover:shadow-smooth-lg'
              }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen size={16} />
                <span className="font-medium text-sm">All Courses</span>
              </div>
              <span className="text-xs opacity-80 ml-6">{courses.length} courses</span>
            </button>

            {/* Category List */}
            <div className="space-y-1.5 mt-3">
              {categories.map((category, index) => {
                const courseCount = courses.filter(c => c.categoryID === category.categoryID).length;
                return (
                  <button
                    key={category.categoryID}
                    onClick={() => {
                      setSelectedCategory(category.categoryID);
                      if (window.innerWidth < 1024) setIsSidebarOpen(false);
                    }}
                    style={{ animationDelay: `${index * 50}ms` }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl transition-all duration-200 transform hover:scale-[1.02] animate-slide-down ${
                      selectedCategory === category.categoryID
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-smooth-lg scale-[1.02]'
                        : 'bg-white hover:bg-slate-50 text-slate-700 shadow-smooth hover:shadow-smooth-lg'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <GraduationCap size={16} />
                      <span className="font-medium text-sm">{category.categoryName}</span>
                    </div>
                    <span className="text-xs opacity-80 ml-6">{courseCount} courses</span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 w-full">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-6 lg:mb-8 animate-slide-down">
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className={`p-3 glass rounded-xl shadow-smooth hover:shadow-smooth-lg transition-all duration-200 transform hover:scale-110 hover:bg-white/80 ${
                    isSidebarOpen ? 'lg:hidden' : ''
                  }`}
                >
                  <Filter size={20} className="text-indigo-600" />
                </button>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text">
                    {selectedCategory 
                      ? categories.find(c => c.categoryID === selectedCategory)?.categoryName 
                      : 'All Courses'}
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">
                    Explore {filteredAndSortedCourses.length} amazing courses
                  </p>
                </div>
              </div>
              
              {/* Search Bar and Sort */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-smooth hover:shadow-smooth-lg transition-all duration-200 placeholder:text-slate-400"
                  />
                </div>
                
                {/* Sort Dropdown */}
                <select
                  value={sortType}
                  onChange={(e) => setSortType(e.target.value as typeof sortType)}
                  className="px-5 py-3.5 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-smooth hover:shadow-smooth-lg cursor-pointer font-medium text-slate-700 transition-all duration-200"
                >
                  <option value="default">Sort by...</option>
                  <option value="name-asc">Name (A → Z)</option>
                  <option value="name-desc">Name (Z → A)</option>
                </select>
              </div>
            </div>

            {/* Course Grid */}
            {filteredAndSortedCourses.length === 0 ? (
              <div className="text-center py-20 animate-scale-in">
                <div className="glass rounded-2xl p-12 max-w-md mx-auto">
                  <BookOpen className="mx-auto w-16 h-16 text-slate-300 mb-4" />
                  <h3 className="text-xl font-semibold text-slate-700">No courses found</h3>
                  <p className="text-slate-500 mt-2">Try adjusting your search or filter</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedCourses.map((course, index) => (
                  <div
                    key={course.courseID}
                    onClick={() => handleCourseClick(course.courseID)}
                    style={{ animationDelay: `${index * 50}ms` }}
                    className="group cursor-pointer animate-scale-in"
                  >
                    {/* Card with pattern background */}
                    <div className="relative h-48 rounded-2xl overflow-hidden shadow-smooth hover:shadow-smooth-lg transition-all duration-300 transform hover:scale-[1.02]">
                      {/* Pattern background - using CSS pattern */}
                      <div 
                        className="absolute inset-0 bg-white"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                          backgroundSize: '30px 30px'
                        }}
                      >
                        {/* Math/Education themed elements overlay */}
                        <div className="absolute inset-0 opacity-5 text-slate-800 text-xs font-mono p-4 overflow-hidden transform rotate-6">
                          <div>∑ ∫ π √ ∞ ≈ ≠ ± × ÷ </div>
                          <div className="mt-1">ax² + bx + c = 0</div>
                          <div className="mt-1">f(x) = y</div>
                          <div className="mt-1">Σ Δ θ α β γ</div>
                          <div className="mt-1">∂f/∂x ∂f/∂y</div>
                        </div>
                      </div>

                      {/* Gradient overlay for better text contrast */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-800/60 via-slate-800/30 to-transparent transition-opacity duration-300" />

                      {/* Content */}
                      <div className="relative h-full flex flex-col justify-end p-6 transition-all duration-300 group-hover:p-7">
                        <h3 className="text-white text-xl font-bold mb-3 drop-shadow-lg transform transition-transform duration-300 group-hover:translate-y-[-4px]">
                          {course.courseTitle}
                        </h3>
                        {course.categoryName && (
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-white/95 text-slate-800 w-fit backdrop-blur-sm shadow-smooth transform transition-all duration-300 group-hover:scale-105">
                            <GraduationCap size={14} className="mr-1.5" />
                            {course.categoryName}
                          </span>
                        )}
                      </div>

                      {/* Hover overlay with gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/0 to-purple-600/0 group-hover:from-indigo-600/20 group-hover:to-purple-600/20 transition-all duration-300" />
                      
                      {/* Shimmer effect on hover */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute inset-0 animate-shimmer" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Results Count */}
            <div className="mt-12 text-center">
              <div className="inline-flex items-center gap-2 glass px-6 py-3 rounded-full shadow-smooth">
                <BookOpen size={16} className="text-indigo-600" />
                <span className="text-sm font-medium text-slate-700">
                  Showing <span className="font-bold text-indigo-600">{filteredAndSortedCourses.length}</span> of <span className="font-bold">{courses.length}</span> courses
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

