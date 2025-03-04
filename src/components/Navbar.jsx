'use client'

import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { useState } from "react"
import { usePathname } from 'next/navigation'
import { HiHome, HiViewGrid, HiCamera, HiUser, HiShoppingCart, HiTruck } from 'react-icons/hi'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const pathname = usePathname()

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
            <span className="text-sm font-medium">Free UK Delivery on orders over £50</span>
          </div>
          <Link href="/cart" className="relative">
            <HiShoppingCart className="h-6 w-6 text-white" />
            <span className="absolute -top-2 -right-2 bg-white text-indigo-600 text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
              0
            </span>
          </Link>
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden sm:block bg-white shadow-md fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold text-indigo-600">MagnetCraft</span>
              </Link>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                <Link href="/products" className="text-gray-700 hover:text-indigo-600 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-indigo-600">
                  Products
                </Link>
                <Link href="/custom" className="text-gray-700 hover:text-indigo-600 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-indigo-600">
                  Create Custom
                </Link>
                <Link href="/about" className="text-gray-700 hover:text-indigo-600 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-indigo-600">
                  About
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/cart" className="relative group">
                <HiShoppingCart className="h-6 w-6 text-gray-700 group-hover:text-indigo-600" />
                <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  0
                </span>
              </Link>
              
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600"
                  >
                    <span className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      {user.email?.[0].toUpperCase()}
                    </span>
                  </button>

                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                      <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50">
                        Profile
                      </Link>
                      <Link href="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50">
                        Orders
                      </Link>
                      <button
                        onClick={() => signOut()}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
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

      {/* Add bottom padding on mobile to account for bottom navigation */}
      <div className="sm:hidden h-16" />
    </>
  )
} 