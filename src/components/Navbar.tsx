"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Menu, X, User, LogOut, BookOpen, Home, LogIn, UserPlus } from 'lucide-react';

interface NavbarProps {
  onSearch?: (term: string) => void;
}

interface UserData {
  userID: number;
  FNAME: string;
  LNAME: string;
  email: string;
  username: string;
  role: string;
}

const Navbar: React.FC<NavbarProps> = ({ onSearch }) => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const authStatus = localStorage.getItem('isAuthenticated');
      const userData = localStorage.getItem('user');
      
      if (authStatus === 'true' && userData) {
        setIsAuthenticated(true);
        setUser(JSON.parse(userData));
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    // Check on mount
    checkAuth();

    // Listen for auth changes
    window.addEventListener('authChange', checkAuth);

    return () => {
      window.removeEventListener('authChange', checkAuth);
    };
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    setUser(null);
    setIsAuthenticated(false);
    setIsProfileOpen(false);
    
    // Trigger auth change event
    window.dispatchEvent(new Event('authChange'));
    
    router.push('/login');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-40 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* LEFT: Logo */}
          <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer group">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center transform transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-smooth">
                <BookOpen className="text-white" size={18} />
              </div>
              <span className="text-xl font-bold tracking-wide text-slate-800 group-hover:text-indigo-600 transition-colors">
                SmartLearn
              </span>
            </Link>
          </div>

          {/* CENTER: Search Bar (Hidden on small mobile) */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                className="block w-full pl-10 pr-3 py-2 border-none rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white/95 backdrop-blur-sm text-sm shadow-smooth hover:shadow-smooth-lg transition-all"
                placeholder="Search by courses or tutors..."
              />
            </div>
          </div>

          {/* RIGHT: Desktop Menu */}
          <div className="hidden md:flex items-center space-x-2">
            <Link href="/dashboard" className="text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-100 px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2">
              <Home size={16} /> <span>Home</span>
            </Link>
            <Link href="/courses" className="text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-100 px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2">
              <BookOpen size={16} /> <span>Courses</span>
            </Link>
            
            {isAuthenticated && user ? (
              /* Profile Dropdown for Authenticated Users */
              <div className="relative">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-all duration-200 transform hover:scale-105"
                >
                  <div className="w-7 h-7 bg-linear-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-smooth">
                    <User size={16} className="text-white" />
                  </div>
                  <span>{user.FNAME}</span>
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-56 glass rounded-2xl shadow-smooth-lg py-2 animate-slide-down overflow-hidden border border-slate-200/50">
                    <div className="px-4 py-3 border-b border-slate-200/50 bg-linear-to-r from-indigo-50 to-purple-50">
                      <p className="text-sm text-slate-900 font-bold">{user.FNAME} {user.LNAME}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-white rounded-full text-xs font-semibold text-indigo-600">
                        {user.role}
                      </span>
                    </div>
                    <Link href="/profile" onClick={() => setIsProfileOpen(false)} className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                      My Profile
                    </Link>
                    <Link href="/settings" onClick={() => setIsProfileOpen(false)} className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                      Settings
                    </Link>
                    <div className="border-t border-slate-200/50 mt-1">
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium flex items-center gap-2"
                      >
                        <LogOut size={16} />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Login/Register Buttons for Guests */
              <>
                <Link 
                  href="/login" 
                  className="text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-100 px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2"
                >
                  <LogIn size={16} />
                  <span>Login</span>
                </Link>
                <Link 
                  href="/register" 
                  className="text-sm font-medium text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-sm"
                >
                  <UserPlus size={16} />
                  <span>Register</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-700 hover:bg-slate-100 focus:outline-none"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU (Expandable) */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 animate-slide-down shadow-sm">
          <div className="px-4 pt-4 pb-2">
            {/* Mobile Search */}
            <div className="relative mb-4 group">
               <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
               <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-3 py-2.5 rounded-xl text-slate-900 bg-white/95 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-smooth"
              />
            </div>
          </div>
          <div className="px-2 pt-2 pb-4 space-y-1">
            <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-base font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition-all">
              <Home size={18} /> Home
            </Link>
            <Link href="/courses" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-base font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition-all">
              <BookOpen size={18} /> Courses
            </Link>
            
            {isAuthenticated && user ? (
              <>
                <div className="px-4 py-3 bg-slate-50 rounded-xl">
                  <p className="text-sm font-bold text-slate-800">{user.FNAME} {user.LNAME}</p>
                  <p className="text-xs text-slate-600">{user.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-white rounded-full text-xs font-semibold text-indigo-600">
                    {user.role}
                  </span>
                </div>
                <Link href="/profile" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-base font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition-all">
                  <User size={18} /> Profile
                </Link>
                <div className="border-t border-slate-200 mt-3 pt-3">
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <LogOut size={18} /> Sign Out
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-base font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition-all">
                  <LogIn size={18} /> Login
                </Link>
                <Link href="/register" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-base font-medium text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all">
                  <UserPlus size={18} /> Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
