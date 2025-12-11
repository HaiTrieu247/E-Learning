"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Course } from '@/src/types/course'
import SearchBar from './SearchBar'
import AlphabetFilter from './AlphabetFilter'

interface CourseTableProps {
  courses: Course[]
  loading: boolean
}

export default function CourseTable({ courses, loading }: CourseTableProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null)
  
  const handleCourseClick = (courseID: number) => {
    router.push(`/courses/${courseID}?courseID=${courseID}`)
  }

  // Filter courses based on search and alphabet filter
  const filteredCourses = courses.filter((course: any) => {
    const matchesSearch = 
      searchQuery === '' ||
      course.CTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.Description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.CategoryName && course.CategoryName.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesLetter = 
      selectedLetter === null ||
      course.CTitle.toUpperCase().startsWith(selectedLetter)

    return matchesSearch && matchesLetter
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-lg text-gray-600">Loading courses...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="space-y-3">
        <SearchBar 
          onSearch={setSearchQuery} 
          placeholder="Search by title, description, or category..." 
        />
        <AlphabetFilter 
          onFilter={setSelectedLetter} 
          selectedLetter={selectedLetter} 
        />
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredCourses.length} of {courses.length} courses
      </div>

      {/* Table */}
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full bg-white border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 border text-left text-sm font-semibold text-gray-700">ID</th>
              <th className="px-4 py-3 border text-left text-sm font-semibold text-gray-700">Course Title</th>
              <th className="px-4 py-3 border text-left text-sm font-semibold text-gray-700">Description</th>
              <th className="px-4 py-3 border text-left text-sm font-semibold text-gray-700">Category</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  No courses found
                </td>
              </tr>
            ) : (
              filteredCourses.map((course: any) => (
                <tr 
                  key={course.CourseID} 
                  onClick={() => handleCourseClick(course.CourseID)}
                  className="hover:bg-indigo-50 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 border text-center">{course.CourseID}</td>
                  <td className="px-4 py-3 border font-medium text-gray-900">{course.CTitle}</td>
                  <td className="px-4 py-3 border text-gray-600 text-sm">
                    {course.Description.length > 100 
                      ? `${course.Description.substring(0, 100)}...` 
                      : course.Description}
                  </td>
                  <td className="px-4 py-3 border">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {course.CategoryName || 'N/A'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
