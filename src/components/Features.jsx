import Link from "next/link";

export default function Features() {
  return (
    <section className="py-10 bg-gradient-to-b from-white to-indigo-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header with decorative elements */}
        <div className="relative text-center mb-16">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-indigo-100 rounded-full opacity-70 blur-2xl"></div>
          </div>
          <div className="relative">
            <span className="inline-block px-4 py-1.5 mb-4 text-xs font-semibold tracking-wider text-pink-700 uppercase bg-pink-100 rounded-full">Why UK Loves Us</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">The My Sweet Magnets Difference</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-pink-400 to-purple-500 mx-auto mb-6 rounded-full"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Handcrafted in the UK with love, our personalised magnets turn your precious memories into beautiful keepsakes that last a lifetime.
            </p>
          </div>
        </div>
        
        {/* Features grid with enhanced visual design */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-10">
          {/* Feature 1 */}
          <div className="group relative bg-white rounded-2xl p-4 shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-500 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg transform group-hover:rotate-6 transition-transform duration-300">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-pink-500 transition-colors duration-300">Premium British Quality</h3>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                Every magnet is meticulously crafted in the UK using the finest materials and state-of-the-art printing technology for vibrant, long-lasting results.
              </p>
              
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-2 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  High-resolution, photo-quality printing
                </li>
                <li className="flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-2 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Vibrant, fade-resistant colours
                </li>
              </ul>
              <Link 
                href="/gallery" 
                className="inline-flex items-center text-sm font-medium text-pink-600 hover:text-pink-800 group"
              >
                View our gallery
                <svg className="ml-1 w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
          
          {/* Feature 2 */}
          <div className="group relative bg-white rounded-2xl p-4 shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg transform group-hover:rotate-6 transition-transform duration-300">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-500 transition-colors duration-300">UK-Made Excellence</h3>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                Proudly made in the UK using premium, eco-friendly materials. Our magnets feature strong magnetic backing and a protective coating for long-lasting durability.
              </p>
              
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-2 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Water and UV resistant finish
                </li>
                <li className="flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-2 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Extra-strong magnetic backing
                </li>
              </ul>
              <Link 
                href="/about" 
                className="inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-800 group"
              >
                About our materials
                <svg className="ml-1 w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
          
          {/* Feature 3 */}
          <div className="group relative bg-white rounded-2xl p-4 shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50 rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg transform group-hover:rotate-6 transition-transform duration-300">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-pink-600 transition-colors duration-300">Perfect Gift Idea</h3>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                Surprise friends and family with personalized magnets that capture special moments and memories, creating a thoughtful gift they'll cherish.
              </p>
              
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-2 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  No minimum order
                </li>
                <li className="flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-2 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Fast UK shipping
                </li>
              </ul>
              <Link 
                href="/custom-order" 
                className="inline-flex items-center text-sm font-medium text-pink-600 hover:text-pink-800 group"
              >
                Start designing now
                <svg className="ml-1 w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Additional feature highlight */}
        <div className="mt-16 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 md:p-10 shadow-md overflow-hidden relative">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-100 rounded-full opacity-50"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-purple-100 rounded-full opacity-50"></div>
          
          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="inline-block px-3 py-1 text-xs font-semibold text-indigo-700 bg-indigo-100 rounded-full mb-4">Made in the UK</span>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Handcrafted with Care</h3>
              <p className="text-gray-600 mb-6">
                Each magnet is carefully crafted in our UK workshop, ensuring the highest quality and attention to detail. We take pride in our work and guarantee your satisfaction.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg className="w-5 h-5 mr-2 text-indigo-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">Locally produced in small batches</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 mr-2 text-indigo-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">Eco-friendly materials and packaging</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 mr-2 text-indigo-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">Quality checked by our expert team</span>
                </li>
              </ul>
            </div>
            
            <div className="relative h-64 md:h-auto">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 bg-white rounded-full shadow-xl flex items-center justify-center p-4">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                    <span className="text-5xl">🇬🇧</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 