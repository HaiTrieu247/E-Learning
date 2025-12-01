"use client"

import { useState } from 'react'
import { Course } from '@/src/types/course'
import SearchBar from './SearchBar'
import AlphabetFilter from './AlphabetFilter'

interface CourseTableProps {
  courses: Course[]
  loading: boolean
}

export default function CourseTable({ courses, loading }: CourseTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null)

  // Filter courses based on search and alphabet filter
  const filteredCourses = courses.filter((course: any) => {
    const matchesSearch = 
      searchQuery === '' ||
      course.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.courseDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.categoryName && course.categoryName.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesLetter = 
      selectedLetter === null ||
      course.courseTitle.toUpperCase().startsWith(selectedLetter)

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
                <tr key={course.courseID} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 border text-center">{course.courseID}</td>
                  <td className="px-4 py-3 border font-medium text-gray-900">{course.courseTitle}</td>
                  <td className="px-4 py-3 border text-gray-600 text-sm">
                    {course.courseDescription.length > 100 
                      ? `${course.courseDescription.substring(0, 100)}...` 
                      : course.courseDescription}
                  </td>
                  <td className="px-4 py-3 border">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {course.categoryName || 'N/A'}
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
