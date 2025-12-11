export interface User {
  UserID: number
  FullName: string
  Email: string
  phoneNumber: string
  Role: 'learner' | 'instructor' | 'admin'
  DateCreated?: Date
  // Role-specific fields
  Birthday?: Date // for learners
  Bio?: string // for instructors
  Specialization?: string // for instructors
  adminID?: number // for admins
  accessLevel?: number // for admins
}
