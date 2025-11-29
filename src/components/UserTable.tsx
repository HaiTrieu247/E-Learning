"use client"

import { useState } from 'react'
import { User } from '@/src/types/user'
import SearchBar from './SearchBar'
import AlphabetFilter from './AlphabetFilter'

interface UserTableProps {
  users: User[]
  loading: boolean
}

export default function UserTable({ users, loading }: UserTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null)

  // Filter users based on search and alphabet filter
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      searchQuery === '' ||
      user.FNAME.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.LNAME.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesLetter = 
      selectedLetter === null ||
      user.FNAME.toUpperCase().startsWith(selectedLetter) ||
      user.LNAME.toUpperCase().startsWith(selectedLetter)

    return matchesSearch && matchesLetter
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-lg text-gray-600">Loading users...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="space-y-3">
        <SearchBar 
          onSearch={setSearchQuery} 
          placeholder="Search by name, email, or username..." 
        />
        <AlphabetFilter 
          onFilter={setSelectedLetter} 
          selectedLetter={selectedLetter} 
        />
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredUsers.length} of {users.length} users
      </div>

      {/* Table */}
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
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
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
    </div>
  )
}
