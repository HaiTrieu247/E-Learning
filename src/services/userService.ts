import { User } from '@/src/types/user'

export const userService = {
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await fetch('/api/users')
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching users:', error)
      throw error
    }
  },

  async getUserById(userId: number): Promise<User> {
    try {
      const response = await fetch(`/api/users/${userId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch user')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching user:', error)
      throw error
    }
  }
}
