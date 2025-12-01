"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Menu, X, User, LogOut, BookOpen, Home } from 'lucide-react';

interface NavbarProps {
  onSearch?: (term: string) => void; // Prop để truyền dữ liệu search ra ngoài nếu cần
}

const Navbar: React.FC<NavbarProps> = ({ onSearch }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <nav className="bg-[#007aaa] text-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* LEFT: Logo */}
          <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
            <Link href="/" className="text-xl font-bold tracking-wide hover:opacity-90 transition">
              BKTutor
            </Link>
          </div>

          {/* CENTER: Search Bar (Hidden on small mobile) */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                className="block w-full pl-10 pr-3 py-1.5 border-none rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 bg-white sm:text-sm shadow-sm transition-all"
                placeholder="Search by courses or tutors..."
              />
            </div>
          </div>

          {/* RIGHT: Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/dashboard" className="text-sm font-medium hover:text-gray-200 transition flex items-center gap-1">
              <Home size={16} /> Home
            </Link>
            <Link href="/courses" className="text-sm font-medium hover:text-gray-200 transition flex items-center gap-1">
              <BookOpen size={16} /> Courses
            </Link>
            
            {/* Profile Dropdown Simulation */}
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 text-sm font-bold uppercase hover:bg-[#006288] px-3 py-1.5 rounded transition"
              >
                <div className="w-6 h-6 bg-white text-[#007aaa] rounded-full flex items-center justify-center">
                  <User size={14} />
                </div>
                Profile
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm text-gray-900 font-bold">Instructor Name</p>
                    <p className="text-xs text-gray-500">instructor@bktutor.com</p>
                  </div>
                  <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    My Profile
                  </Link>
                  <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Settings
                  </Link>
                  <button className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-[#006288] focus:outline-none"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU (Expandable) */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#006a94] border-t border-[#005c80]">
          <div className="px-4 pt-4 pb-2">
            {/* Mobile Search */}
            <div className="relative mb-4">
               <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
               <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-3 py-2 rounded-md text-gray-900 bg-white focus:outline-none"
              />
            </div>
          </div>
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link href="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-[#005c80]">
              Home
            </Link>
            <Link href="/courses" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-[#005c80]">
              Courses
            </Link>
            <Link href="/profile" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-[#005c80]">
              Profile
            </Link>
            <div className="border-t border-[#005c80] mt-2 pt-2">
               <button className="flex items-center gap-2 w-full px-3 py-2 text-base font-medium text-red-200 hover:bg-[#005c80] hover:text-white">
                 <LogOut size={18} /> Sign Out
               </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
