export interface Course {
  courseID: number
  courseTitle: string
  courseDescription: string
  categoryID?: number
  categoryName?: string
  approvalStatus: 'pending' | 'approved' | 'rejected'
  courseStatus: 'draft' | 'active' | 'archived'
  createdDate: string
  lastModified?: string
}

export interface CourseCategory {
  categoryID: number
  categoryName: string
  ParentCategoryID?: number
}
