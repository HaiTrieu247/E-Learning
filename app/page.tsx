"use client"

import { useEffect, useState } from 'react'
import { User } from '@/src/types/user'
import { Course } from '@/src/types/course'
import UserTable from '@/src/components/UserTable'
import CourseTable from '@/src/components/CourseTable'
import { userService } from '@/src/services/userService'
import { courseService } from '@/src/services/courseService'

export default function Home() {
  const [users, setUsers] = useState<User[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [coursesLoading, setCoursesLoading] = useState(true)

  useEffect(() => {
    // Fetch users
    userService.getAllUsers()
      .then((data) => {
        setUsers(data)
        setUsersLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching users:', error)
        setUsersLoading(false)
      })

    // Fetch courses
    courseService.getAllCourses()
      .then((data) => {
        setCourses(data)
        setCoursesLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching courses:', error)
        setCoursesLoading(false)
      })
  }, [])

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            E-Learning Application
          </h1>
          <p className="text-gray-600">Manage users, courses, and content</p>
        </div>
        
        {/* Users Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">All Users</h2>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {users.length} users
            </span>
          </div>
          <UserTable users={users} loading={usersLoading} />
        </div>

        {/* Courses Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">All Courses</h2>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              {courses.length} courses
            </span>
          </div>
          <CourseTable courses={courses} loading={coursesLoading} />
        </div>
        
        <div className="mt-6">
          <a 
            href="/quizzes" 
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Quizzes Page
          </a>
        </div>

        <div className="mt-6">
          <a 
            href="/courses" 
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Courses Page
          </a>
        </div>
      </div>
    </main>
  )
}

