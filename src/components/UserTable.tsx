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
      user.FullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.Email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesLetter = 
      selectedLetter === null ||
      user.FullName.toUpperCase().startsWith(selectedLetter)

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
          placeholder="Search by name or email..." 
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
              <th className="px-4 py-3 border text-left text-sm font-semibold text-gray-700">Full Name</th>
              <th className="px-4 py-3 border text-left text-sm font-semibold text-gray-700">Email</th>
              <th className="px-4 py-3 border text-left text-sm font-semibold text-gray-700">Phone</th>
              <th className="px-4 py-3 border text-left text-sm font-semibold text-gray-700">Role</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.UserID} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 border text-center">{user.UserID}</td>
                  <td className="px-4 py-3 border">{user.FullName}</td>
                  <td className="px-4 py-3 border">{user.Email}</td>
                  <td className="px-4 py-3 border">{user.phoneNumber}</td>
                  <td className="px-4 py-3 border">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.Role === 'admin' ? 'bg-red-100 text-red-800' : 
                      user.Role === 'instructor' ? 'bg-blue-100 text-blue-800' : 
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.Role}
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
