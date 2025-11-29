"use client"

import { useEffect, useState } from 'react'
import { User } from '@/src/types/user'
import UserTable from '@/src/components/UserTable'
import { userService } from '@/src/services/userService'

export default function Home() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    userService.getAllUsers()
      .then((data) => {
        setUsers(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching users:', error)
        setLoading(false)
      })
  }, [])

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            E-Learning Application
          </h1>
          <p className="text-gray-600">Manage users, courses, and content</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">All Users</h2>
          <UserTable users={users} loading={loading} />
        </div>
        
        <div className="mt-6">
          <a 
            href="/quizzes" 
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Quizzes Page
          </a>
        </div>
      </div>
    </main>
  )
}

