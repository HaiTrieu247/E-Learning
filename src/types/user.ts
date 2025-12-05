export interface User {
  userID: number
  FNAME: string
  LNAME: string
  email: string
  username: string
  role: 'learner' | 'instructor' | 'admin'
  phoneNumber: string
  approvalStatus: 'pending' | 'approved' | 'rejected'
  accountStatus: 'active' | 'inactive' | 'suspended'
  createdDate: string
  instructorID?: number
  learnerID?: number
  adminID?: number
}
