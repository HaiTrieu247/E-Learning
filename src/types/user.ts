export interface User {
  userID: number
  objectID?: number
  FNAME: string
  LNAME: string
  email: string
  username: string
  role: 'learner' | 'instructor' | 'admin'
  phoneNumber: string
}
