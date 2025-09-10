'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { FcGoogle } from 'react-icons/fc'
import { HiMail, HiLockClosed } from 'react-icons/hi'
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
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[radial-gradient(40rem_30rem_at_20%_20%,#fde5f2,transparent),radial-gradient(40rem_30rem_at_80%_0%,#ede9fe,transparent)]">
      {/* decorative blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-pink-200/40 blur-3xl"></div>
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-purple-200/40 blur-3xl"></div>

      <div className="relative max-w-md w-full mx-auto">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-pink-200/50 to-purple-200/50 blur-xl"></div>
        <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/70 ring-1 ring-pink-200/60 px-8 py-7">
          <div>
          <Image src="/logo.svg" alt="My Sweet Magnets" width={160} height={48} className="mx-auto mb-3" />
          <h2 className="text-center font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 text-xl sm:text-2xl mb-1">Sign in to your account</h2>
          <p className="mt-1 text-center text-sm text-gray-600 mb-5">
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
            className="w-full flex items-center justify-center px-4 py-3 rounded-xl shadow-sm text-sm font-medium text-pink-700 bg-white hover:bg-pink-50 transition border border-pink-200/60"
          >
            <FcGoogle className="h-5 w-5 mr-2" />
            Continue with Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-pink-200" />
            </div>
            <div className="relative flex justify-center text-sm mt-4 mb-4">
              <span className="px-2 bg-white/90 text-pink-500">Or continue with</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-pink-700">
                Email address
              </label>
              <div className="relative mt-1">
              <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-pink-400" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2 border border-pink-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300 bg-white/90"
              />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-pink-700">
                Password
              </label>
              <div className="relative mt-1">
              <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-pink-400" />
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2 border border-pink-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300 bg-white/90"
              />
              </div>
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
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition mt-2"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <p className="text-xs text-center text-gray-500 mt-4">Secure sign-in. We never share your email.</p>
        </div>
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
