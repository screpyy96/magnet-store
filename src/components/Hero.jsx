import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white py-4 sm:py-10 md:py-10">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23D8B4FE\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          backgroundSize: '30px 30px'
        }}></div>
      </div>
      

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Text Content */}
          <div className="relative z-10 text-center md:text-left">
            <div className="inline-block mb-3 md:mb-5">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-pink-100 to-pink-200 text-pink-800 border border-pink-200 shadow-sm">
                <span className="mr-2">✨</span> Handcrafted in the UK
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4 md:mb-6 leading-tight">
              Sweet Memories as{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-amber-400 relative">
                Beautiful Magnets
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-amber-200 opacity-70" viewBox="0 0 358 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 5C1 5 72 9 179 9C286 9 357 5 357 5" stroke="currentColor" strokeWidth="8" strokeLinecap="round"/>
                </svg>
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed">
              Transform your cherished photos into stunning fridge magnets. Perfect for preserving memories, decorating your space, or giving as thoughtful gifts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 md:justify-start justify-center">
              <Link
                href="/custom"
                className="inline-flex items-center justify-center px-6 py-3.5 border border-transparent text-base font-medium rounded-full text-white bg-gradient-to-r from-pink-400 to-amber-400 hover:from-pink-500 hover:to-amber-500 transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Create Your Magnet
                <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/gallery"
                className="inline-flex items-center justify-center px-6 py-3.5 border-2 border-pink-400 text-base font-medium rounded-full text-pink-600 bg-white hover:bg-pink-50 transform transition-all duration-200 hover:scale-105"
              >
                Browse Designs
                <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </Link>
            </div>
            
            {/* Trust badges */}
            <div className="mt-8 flex flex-wrap gap-4 justify-center md:justify-start">
              <div className="flex items-center text-sm text-gray-500 bg-white px-3 py-1.5 rounded-full shadow-sm border border-blue-100">
                <svg className="w-5 h-5 mr-1.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Premium Quality
              </div>
              <div className="flex items-center text-sm text-gray-500 bg-white px-3 py-1.5 rounded-full shadow-sm border border-amber-100">
                <svg className="w-5 h-5 mr-1.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                UK Delivery
              </div>
              <div className="flex items-center text-sm text-gray-500 bg-white px-3 py-1.5 rounded-full shadow-sm border border-pink-100">
                <svg className="w-5 h-5 mr-1.5 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                100% Satisfaction
              </div>
            </div>
          </div>
          
          {/* Image Side with floating magnets */}
          <div className="relative hidden md:block">
            <div className="relative z-10 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-2">
              <div className="aspect-[4/3] relative rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-pink-50">
                {/* Fridge background */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="w-full h-full relative">
                    {/* Fridge handle */}
                    <div className="absolute right-6 top-1/2 transform -translate-y-1/2 w-3 h-32 bg-gray-300 rounded-r"></div>
                    
                    {/* Floating magnet examples with subtle animations and new colors */}
                    <div className="absolute top-[15%] left-[20%] w-24 h-24 rounded-lg shadow-lg transform rotate-6 bg-white p-1 animate-float">
                      <div className="w-full h-full bg-gradient-to-br from-pink-100 to-pink-200 rounded overflow-hidden flex items-center justify-center">
                        <div className="text-pink-600 font-bold">Family</div>
                      </div>
                    </div>
                    
                    <div className="absolute top-[25%] right-[25%] w-28 h-28 rounded-lg shadow-lg transform -rotate-3 bg-white p-1 animate-float animation-delay-1000">
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 rounded overflow-hidden flex items-center justify-center">
                        <div className="text-blue-600 font-bold">Vacation</div>
                      </div>
                    </div>
                    
                    <div className="absolute bottom-[20%] left-[30%] w-32 h-32 rounded-lg shadow-lg transform rotate-12 bg-white p-1 animate-float animation-delay-2000">
                      <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200 rounded overflow-hidden flex items-center justify-center">
                        <div className="text-amber-600 font-bold">Love</div>
                      </div>
                    </div>
                    
                    <div className="absolute bottom-[30%] right-[15%] w-20 h-20 rounded-lg shadow-lg transform -rotate-6 bg-white p-1 animate-float animation-delay-3000">
                      <div className="w-full h-full bg-gradient-to-br from-pink-100 to-blue-100 rounded overflow-hidden flex items-center justify-center">
                        <div className="text-pink-600 font-bold">Pets</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements with new colors */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-amber-200 rounded-full opacity-50 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-36 h-36 bg-pink-200 rounded-full opacity-50 blur-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
} 