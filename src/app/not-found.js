'use client'

import Link from 'next/link'
import { HiOutlineEmojiSad, HiHome, HiArrowLeft } from 'react-icons/hi'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center space-y-8">
        {/* Icon and Main Message */}
        <div className="space-y-4">
          <HiOutlineEmojiSad className="mx-auto h-20 w-20 text-indigo-500" />
          <h1 className="text-4xl font-bold text-gray-900">Page Under Construction</h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            Sorry, but this page is still under construction. Come back soon to discover new features!
          </p>
        </div>

        {/* Construction Animation */}
        <div className="relative h-4 w-64 mx-auto bg-gray-200 rounded-full overflow-hidden">
          <div className="absolute inset-0 bg-indigo-500 animate-progress-infinite"></div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
          >
            <HiHome className="mr-2 h-5 w-5" />
            Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
          >
            <HiArrowLeft className="mr-2 h-5 w-5" />
            Back
          </button>
        </div>
      </div>
    </div>
  )
} 