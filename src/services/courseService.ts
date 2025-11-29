import { Course } from '@/src/types/course'

export const courseService = {
  async getAllCourses(): Promise<Course[]> {
    try {
      const response = await fetch('/api/courses')
      if (!response.ok) {
        throw new Error('Failed to fetch courses')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching courses:', error)
      throw error
    }
  },

  async getCourseById(courseId: number): Promise<Course> {
    try {
      const response = await fetch(`/api/courses/${courseId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch course')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching course:', error)
      throw error
    }
  }
}
