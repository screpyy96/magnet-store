'use client'

import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { useState, useRef, useEffect } from "react"
import { usePathname } from 'next/navigation'
import { HiHome, HiViewGrid, HiCamera, HiUser, HiTruck, HiShoppingCart } from 'react-icons/hi'
import Cart from './Cart'
import { AnimatePresence, motion } from 'framer-motion'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
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

  const mobileNavItems = [
    { name: 'Home', href: '/', icon: HiHome },
    { name: 'Products', href: '/products', icon: HiViewGrid },
    { name: 'Create', href: '/custom', icon: HiCamera },
    { name: user ? 'Profile' : 'Sign In', href: user ? '/profile' : '/login', icon: HiUser }
  ]

  return (
    <>
      {/* Mobile Top Banner */}
      <div className="sm:hidden bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <HiTruck className="h-5 w-5" />
            <span className="text-sm font-medium">Free Shipping on orders over £50</span>
          </div>
          <Cart />
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav className="bg-white shadow-md fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold text-indigo-600">MagnetCraft</span>
              </Link>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                <Link href="/custom" className="text-gray-700 hover:text-indigo-600 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-indigo-600">
                  Create Custom
                </Link>
                <Link href="/products" className="text-gray-700 hover:text-indigo-600 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-indigo-600">
                  Products
                </Link>
                <Link href="/about" className="text-gray-700 hover:text-indigo-600 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-indigo-600">
                  About
                </Link>
                <Link href="/contact" className="text-gray-700 hover:text-indigo-600 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-indigo-600">
                  Contact
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Cart />
              
              {user ? (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-3 text-gray-700 hover:text-indigo-600 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg transition-all duration-150"
                  >
                    <span className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium shadow-inner">
                      {user.email?.[0].toUpperCase()}
                    </span>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-gray-900">{user.email}</p>
                      <p className="text-xs text-gray-500">View account</p>
                    </div>
                    <svg className="hidden sm:block h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <AnimatePresence>
                    {isProfileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200/50 py-2 z-50"
                      >
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{user.email}</p>
                          <p className="text-xs text-gray-500 mt-1">Signed in with Email</p>
                        </div>
                        <div className="py-1">
                          <Link 
                            href="/profile" 
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 space-x-3"
                          >
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>Profile</span>
                          </Link>
                          <Link 
                            href="/orders" 
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 space-x-3"
                          >
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            <span>Orders</span>
                          </Link>
                          <button
                            onClick={() => signOut()}
                            className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 space-x-3"
                          >
                            <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-4 h-16">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center space-y-1 ${
                  isActive ? 'text-indigo-600' : 'text-gray-600'
                }`}
              >
                <item.icon className={`h-6 w-6 ${isActive ? 'text-indigo-600' : 'text-gray-600'}`} />
                <span className="text-xs">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
} 