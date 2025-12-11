export interface Course {
  CourseID: number
  CTitle: string
  Description: string
  Created_date?: Date
  Status?: string
  CategoryID?: number
  CategoryName?: string
}

export interface CourseCategory {
  CategoryID: number
  Name: string
  Parent_ID?: number
}
