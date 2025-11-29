"use client"

import { User } from '@/src/types/user'

interface UserTableProps {
  users: User[]
  loading: boolean
}

export default function UserTable({ users, loading }: UserTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-lg text-gray-600">Loading users...</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto shadow-md rounded-lg">
      <table className="min-w-full bg-white border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3 border text-left text-sm font-semibold text-gray-700">ID</th>
            <th className="px-4 py-3 border text-left text-sm font-semibold text-gray-700">First Name</th>
            <th className="px-4 py-3 border text-left text-sm font-semibold text-gray-700">Last Name</th>
            <th className="px-4 py-3 border text-left text-sm font-semibold text-gray-700">Email</th>
            <th className="px-4 py-3 border text-left text-sm font-semibold text-gray-700">Username</th>
            <th className="px-4 py-3 border text-left text-sm font-semibold text-gray-700">Phone</th>
            <th className="px-4 py-3 border text-left text-sm font-semibold text-gray-700">Role</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                No users found
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.userID} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 border text-center">{user.userID}</td>
                <td className="px-4 py-3 border">{user.FNAME}</td>
                <td className="px-4 py-3 border">{user.LNAME}</td>
                <td className="px-4 py-3 border">{user.email}</td>
                <td className="px-4 py-3 border">{user.username}</td>
                <td className="px-4 py-3 border">{user.phoneNumber}</td>
                <td className="px-4 py-3 border">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.role === 'admin' ? 'bg-red-100 text-red-800' : 
                    user.role === 'instructor' ? 'bg-blue-100 text-blue-800' : 
                    'bg-green-100 text-green-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
