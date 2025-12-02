export interface Course {
  courseID: number
  courseTitle: string
  courseDescription: string
  categoryID?: number
  categoryName?: string
}

export interface CourseCategory {
  categoryID: number
  categoryName: string
  ParentCategoryID?: number
}
