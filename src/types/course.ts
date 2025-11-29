export interface Course {
  courseID: number
  courseTitle: string
  courseDescription: string
  categoryID?: number
}

export interface CourseCategory {
  categoryID: number
  categoryName: string
  ParentCategoryID?: number
}
