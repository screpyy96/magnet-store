"use client"
import Link from "next/link";
import Hero from "@/components/Hero";
import Features from "@/components/Features";

export default function Home() {
  return (
    <div className="relative">
      {/* Hero Section - Now using the separate Hero component */}
      <Hero />

      {/* Features Section - Now using the separate Features component */}
      <Features />
      
      {/* Call to Action with updated colors */}
      <section className="py-16 bg-gradient-to-r from-pink-400 to-amber-400 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative">
            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-200 rounded-full opacity-30 blur-xl"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-pink-200 rounded-full opacity-30 blur-xl"></div>
            
            <h2 className="relative text-3xl font-bold mb-6 text-white">Ready to Create Your Custom Magnets?</h2>
            <p className="relative text-xl text-white text-opacity-90 mb-8 max-w-3xl mx-auto">
              Turn your favorite photos into beautiful magnets in just a few clicks.
            </p>
            <Link
              href="/custom"
              className="relative inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-full text-pink-600 bg-white hover:bg-blue-50 transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Get Started Now
              <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
