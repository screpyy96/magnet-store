'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { FcGoogle } from 'react-icons/fc'
import Image from 'next/image'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn, signInWithGoogle, user, loading, getAndClearRedirectUrl } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const redirectUrl = searchParams.get('redirect') || '/';

  // Check for error or message in URL
  useEffect(() => {
    const errorMsg = searchParams.get('error')
    const message = searchParams.get('message')
    
    if (errorMsg) {
      setError(decodeURIComponent(errorMsg))
    }
    
    if (message) {
      setSuccessMessage(decodeURIComponent(message))
    }
  }, [searchParams])

  useEffect(() => {
    if (!loading && user) {
      // First check for URL parameter, then stored redirect, then default to homepage
      const storedRedirectUrl = getAndClearRedirectUrl()
      const finalRedirectUrl = redirectUrl || storedRedirectUrl || '/'
      router.push(finalRedirectUrl)
    }
  }, [user, loading, router, redirectUrl, getAndClearRedirectUrl])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccessMessage('')

    try {
      // Create a simpler signin object
      const signInData = {
        email: formData.email,
        password: formData.password,
      };
      
      const result = await signIn(signInData, redirectUrl);

      if (result.success) {
        // Login successful, redirecting handled by useEffect
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      setError(error.message || 'Failed to sign in. Please check your credentials and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const result = await signInWithGoogle(redirectUrl);
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      // This code won't execute due to redirect
    } catch (error) {
      setError(error.message || 'Failed to sign in with Google. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-pink-200 px-8 py-6 mx-auto">
        <div>
          <Image src="/logo.png" alt="My Sweet Magnets Logo" width={64} height={64} style={{ width: '64px', height: 'auto' }} className="mx-auto mb-4" />
          <h2 className="text-center font-bold text-pink-700 font-nunito text-lg on-mobile:text-2xl mb-2">Sign in to your account</h2>
          <p className="mt-2 text-center text-sm text-gray-600 mb-4">
            Or{' '}
            <Link href="/register" className="font-medium text-pink-600 hover:text-purple-500">
              create a new account
            </Link>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
            {successMessage}
          </div>
        )}

        <div className="space-y-4">
          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center px-4 py-3 border border-pink-200 rounded-full shadow-sm text-sm font-medium text-pink-700 bg-white hover:bg-pink-50 transition mb-4"
          >
            <FcGoogle className="h-5 w-5 mr-2" />
            Continue with Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-pink-300" />
            </div>
            <div className="relative flex justify-center text-sm mt-4 mb-4">
              <span className="px-2 bg-pink-50 text-pink-500">Or continue with</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-pink-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-pink-300 rounded-full shadow-sm focus:outline-none focus:ring-pink-400 focus:border-pink-400 bg-pink-50 mb-3"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-pink-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-pink-300 rounded-full shadow-sm focus:outline-none focus:ring-pink-400 focus:border-pink-400 bg-pink-50 mb-3"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-pink-600 focus:ring-pink-400 border-pink-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-pink-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link href="/forgot-password" className="font-medium text-pink-600 hover:text-purple-500">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-purple-500 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition mt-4"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

// Loading fallback UI for the Suspense boundary
function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
    </div>
  );
}

// Wrap the LoginForm component with Suspense
export default function Login() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  );
} 