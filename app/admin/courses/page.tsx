'use client'

import { useState, useEffect } from 'react'
import { Course } from '@/src/types/course'
import { CheckCircle, XCircle, Clock, FileText, Archive } from 'lucide-react'

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({
    approvalStatus: '',
    courseStatus: ''
  })

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter.approvalStatus) params.append('approvalStatus', filter.approvalStatus)
      if (filter.courseStatus) params.append('courseStatus', filter.courseStatus)

      const response = await fetch(`/api/admin/courses?${params}`)
      const data = await response.json()
      setCourses(data.courses || [])
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [filter])

  const updateCourseStatus = async (
    courseID: number,
    approvalStatus?: string,
    courseStatus?: string
  ) => {
    try {
      const userData = localStorage.getItem('user')
      if (!userData) return

      const user = JSON.parse(userData)
      const response = await fetch('/api/admin/courses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseID,
          approvalStatus,
          courseStatus,
          adminID: user.adminID,
          actionNotes: `Updated by ${user.username}`
        })
      })

      if (response.ok) {
        fetchCourses()
      }
    } catch (error) {
      console.error('Error updating course:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'rejected':
      case 'archived':
        return <Archive className="w-4 h-4 text-gray-500" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'draft':
        return <FileText className="w-4 h-4 text-blue-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'rejected':
      case 'archived':
        return 'bg-gray-100 text-gray-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'draft':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Course Management</h1>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <select
          className="border rounded px-4 py-2"
          value={filter.approvalStatus}
          onChange={(e) => setFilter({ ...filter, approvalStatus: e.target.value })}
        >
          <option value="">All Approval Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <select
          className="border rounded px-4 py-2"
          value={filter.courseStatus}
          onChange={(e) => setFilter({ ...filter, courseStatus: e.target.value })}
        >
          <option value="">All Course Status</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Courses Table */}
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approval</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {courses.map((course) => (
                <tr key={course.courseID} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{course.courseID}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {course.courseTitle}
                    </div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {course.courseDescription}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {course.categoryName || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(course.approvalStatus)}
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(course.approvalStatus)}`}>
                        {course.approvalStatus}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(course.courseStatus)}
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(course.courseStatus)}`}>
                        {course.courseStatus}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(course.createdDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex flex-col gap-1">
                      {course.approvalStatus === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateCourseStatus(course.courseID, 'approved')}
                            className="text-green-600 hover:text-green-900"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateCourseStatus(course.courseID, 'rejected')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {course.courseStatus === 'draft' && course.approvalStatus === 'approved' && (
                        <button
                          onClick={() => updateCourseStatus(course.courseID, undefined, 'active')}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Activate
                        </button>
                      )}
                      {course.courseStatus === 'active' && (
                        <button
                          onClick={() => updateCourseStatus(course.courseID, undefined, 'archived')}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Archive
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && courses.length === 0 && (
        <div className="text-center py-8 text-gray-500">No courses found</div>
      )}
    </div>
  )
}
