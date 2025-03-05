"use client"
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative">
      {/* Hero Section - Enhanced with modern design */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%234f46e5\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: '30px 30px'
          }}></div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        
        <style jsx>{`
          @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(20px, -30px) scale(1.1); }
            66% { transform: translate(-10px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
          .animate-blob {
            animation: blob 12s infinite ease-in-out;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
        `}</style>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 md:py-32">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Text Content */}
            <div className="relative z-10 text-center md:text-left">
              <div className="inline-block mb-3 md:mb-5">
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-100 shadow-sm">
                  <span className="mr-2">🎨</span> Design Your Own Magnets
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4 md:mb-6 leading-tight">
                Transform Your Fridge with{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 relative">
                  Custom Magnets
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-indigo-200 opacity-50" viewBox="0 0 358 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 5C1 5 72 9 179 9C286 9 357 5 357 5" stroke="currentColor" strokeWidth="8" strokeLinecap="round"/>
                  </svg>
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed">
                Create unique, personalized magnets that bring life to your space. Perfect for memories, decoration, or thoughtful gifts for loved ones.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 md:justify-start justify-center">
                <Link
                  href="/custom"
                  className="inline-flex items-center justify-center px-6 py-3.5 border border-transparent text-base font-medium rounded-full text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Start Designing
                  <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  href="/gallery"
                  className="inline-flex items-center justify-center px-6 py-3.5 border-2 border-indigo-600 text-base font-medium rounded-full text-indigo-600 bg-white hover:bg-indigo-50 transform transition-all duration-200 hover:scale-105"
                >
                  View Gallery
                  <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </Link>
              </div>
              
              {/* Trust badges */}
              <div className="mt-8 flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="w-5 h-5 mr-1.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Premium Quality
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="w-5 h-5 mr-1.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Fast Shipping
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="w-5 h-5 mr-1.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  100% Satisfaction
                </div>
              </div>
            </div>
            
            {/* Image Side with floating magnets */}
            <div className="relative hidden md:block">
              <div className="relative z-10 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-2">
                <div className="aspect-[4/3] relative rounded-xl overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50">
                  {/* Replace with your actual image */}
                  <div className="absolute inset-0 flex items-center justify-center text-indigo-600 text-opacity-10 font-extrabold text-9xl">
                    MAGNETS
                  </div>
                  
                  {/* Floating magnet examples */}
                  <div className="absolute top-[10%] left-[20%] w-24 h-24 rounded-lg shadow-lg transform rotate-6 bg-white p-1">
                    <div className="w-full h-full bg-gray-200 rounded overflow-hidden">
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Photo 1</div>
                    </div>
                  </div>
                  
                  <div className="absolute top-[30%] right-[15%] w-28 h-28 rounded-lg shadow-lg transform -rotate-3 bg-white p-1">
                    <div className="w-full h-full bg-gray-200 rounded overflow-hidden">
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Photo 2</div>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-[15%] left-[30%] w-32 h-32 rounded-lg shadow-lg transform rotate-12 bg-white p-1">
                    <div className="w-full h-full bg-gray-200 rounded overflow-hidden">
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Photo 3</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-yellow-200 rounded-full opacity-50 blur-2xl"></div>
              <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-36 h-36 bg-pink-200 rounded-full opacity-50 blur-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-b from-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose Our Magnets?</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              We combine quality materials with beautiful design to create magnets you'll love.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4 text-indigo-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">High-Quality Printing</h3>
              <p className="text-gray-600">
                Our advanced printing technology ensures your photos look vibrant and clear on every magnet.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4 text-purple-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Durable Materials</h3>
              <p className="text-gray-600">
                Made to last with strong magnetic backing and water-resistant coating for long-lasting quality.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-4 text-pink-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Perfect Gift Idea</h3>
              <p className="text-gray-600">
                Surprise friends and family with personalized magnets that capture special moments and memories.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Create Your Custom Magnets?</h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-3xl mx-auto">
            Turn your favorite photos into beautiful magnets in just a few clicks.
          </p>
          <Link
            href="/custom"
            className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-full text-indigo-700 bg-white hover:bg-indigo-50 transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Get Started Now
            <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
