'use client'

import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { useState, useRef, useEffect } from "react"
import { usePathname } from 'next/navigation'
import { HiHome, HiViewGrid, HiCamera, HiUser, HiMenu, HiX, HiChevronDown, HiInformationCircle, HiMail } from 'react-icons/hi'
import { FiShoppingBag, FiUser, FiLogOut, FiPackage, FiSettings } from 'react-icons/fi'
import Cart from './Cart'
import { AnimatePresence, motion } from 'framer-motion'

const navigation = [
  { name: 'Home', href: '/', icon: HiHome },
  { name: 'Shop', href: '/products', icon: HiViewGrid },
  { name: 'Create', href: '/custom', icon: HiCamera, highlight: true },
  { name: 'About', href: '/about', icon: HiInformationCircle },
  { name: 'Contact', href: '/contact', icon: HiMail },
]

export default function Navbar() {
  const { user, signOut, isAdmin } = useAuth()
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const menuRef = useRef(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Simple mobile bottom nav items (max 5 for good UX)
  const mobileBottomNavItems = [
    { name: 'Home', href: '/', icon: HiHome },
    { name: 'Shop', href: '/products', icon: HiViewGrid },
    { name: 'Create', href: '/custom', icon: HiCamera },
    { name: 'Account', href: user ? '/account' : '/login', icon: HiUser },
  ]

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="bg-white/95 backdrop-blur-md shadow-sm fixed w-full z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Left side - Logo */}
            <Link href="/" className="flex items-center group">
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent transition-all duration-300 group-hover:opacity-90">
                Magnet Store
              </span>
            </Link>

            {/* Desktop Navigation Links - Hidden on mobile */}
            <div className="hidden md:flex md:ml-10 md:space-x-6 flex-1 justify-center">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group relative px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    pathname === item.href
                      ? 'text-indigo-600'
                      : 'text-gray-700 hover:text-indigo-600'
                  } ${item.highlight ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:-translate-y-0.5' : ''}`}
                >
                  <div className="flex items-center">
                    {item.icon && <item.icon className="h-5 w-5 mr-2" />}
                    {item.name}
                  </div>
                  {!item.highlight && (
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 transition-all duration-300 group-hover:w-full"></span>
                  )}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  href="/admin/dashboard"
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-100 to-amber-50 text-amber-800 border border-amber-200 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                >
                  Admin
                </Link>
              )}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3 md:space-x-4">
              <Cart />
              
              {/* Mobile menu button */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none md:hidden"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <HiX className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <HiMenu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
              
              {/* Desktop Account Section */}
              {user ? (
                <div className="hidden md:flex relative" ref={menuRef}>
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 bg-white hover:bg-gray-50 px-2.5 py-2 rounded-xl transition-all duration-200 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 overflow-hidden group"
                  >
                    <span className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm relative overflow-hidden">
                      {user.email?.[0].toUpperCase()}
                      <span className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    </span>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                        {user.email?.split('@')[0] || 'My Account'}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center">
                        Account
                        <HiChevronDown className={`ml-1 h-3 w-3 transition-transform duration-200 ${isProfileMenuOpen ? 'transform rotate-180' : ''}`} />
                      </p>
                    </div>
                  </button>

                  <AnimatePresence>
                    {isProfileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden z-50"
                      >
                        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium text-lg">
                              {user.email?.[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{user.email}</p>
                              <p className="text-xs text-indigo-600">View account</p>
                            </div>
                          </div>
                        </div>
                        <div className="py-1">
                          <Link 
                            href="/account" 
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <FiUser className="h-5 w-5 text-gray-400 mr-3" />
                            <span>My Account</span>
                          </Link>
                          <Link 
                            href="/orders" 
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <FiPackage className="h-5 w-5 text-gray-400 mr-3" />
                            <span>My Orders</span>
                          </Link>
                          {isAdmin && (
                            <Link 
                              href="/admin/dashboard" 
                              onClick={() => setIsProfileMenuOpen(false)}
                              className="flex items-center px-4 py-3 text-sm text-indigo-600 hover:bg-indigo-50 transition-colors border-t border-gray-100 mt-1"
                            >
                              <FiSettings className="h-5 w-5 text-indigo-500 mr-3" />
                              <span>Admin Dashboard</span>
                            </Link>
                          )}
                          <button
                            onClick={() => signOut()}
                            className="flex w-full items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100 mt-1"
                          >
                            <FiLogOut className="h-5 w-5 text-red-500 mr-3" />
                            <span>Sign out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="hidden md:inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
                >
                  <HiUser className="h-4 w-4 mr-2" />
                  Account
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 top-16 z-40 md:hidden bg-white/95 backdrop-blur-md overflow-y-auto pb-20"
          >
            <div className="px-4 py-6 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-4 text-lg font-medium rounded-xl mx-2 transition-all duration-200 ${
                    pathname === item.href
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100 hover:pl-6'
                  }`}
                >
                  {item.icon && <item.icon className="h-6 w-6 mr-4" />}
                  {item.name}
                </Link>
              ))}
              
              <div className="border-t border-gray-200 pt-4 mt-6">
                {user ? (
                  <>
                    <Link
                      href="/account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center px-4 py-4 text-lg font-medium rounded-xl mx-2 text-gray-700 hover:bg-gray-100 hover:pl-6 transition-all duration-200"
                    >
                      <HiUser className="h-6 w-6 mr-4" />
                      My Account
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center px-4 py-4 text-lg font-medium rounded-xl mx-2 text-amber-700 hover:bg-amber-50 hover:pl-6 transition-all duration-200"
                      >
                        <FiSettings className="h-6 w-6 mr-4" />
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {signOut(); setMobileMenuOpen(false)}}
                      className="flex w-full items-center px-4 py-4 text-lg font-medium rounded-xl mx-2 text-red-600 hover:bg-red-50 hover:pl-6 transition-all duration-200"
                    >
                      <FiLogOut className="h-6 w-6 mr-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center px-4 py-4 text-lg font-medium rounded-xl mx-2 bg-indigo-600 text-white hover:bg-indigo-700 transition-all duration-200"
                    >
                      <HiUser className="h-6 w-6 mr-4" />
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center px-4 py-4 text-lg font-medium rounded-xl mx-2 text-gray-700 hover:bg-gray-100 hover:pl-6 transition-all duration-200"
                    >
                      <HiUser className="h-6 w-6 mr-4" />
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-50 shadow-xl">
        <div className="grid grid-cols-4 h-16">
          {mobileBottomNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center space-y-1 transition-all duration-200 relative ${
                  isActive 
                    ? 'text-indigo-600' 
                    : 'text-gray-500 hover:text-indigo-600'
                }`}
              >
                {isActive && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-indigo-600 rounded-b-full" />
                )}
                <item.icon className={`h-5 w-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                  {item.name}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
} 