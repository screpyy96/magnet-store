import Link from "next/link";

export default function CallToAction() {
  return (
    <section className="relative py-20 bg-gradient-to-br from-indigo-600 to-purple-700 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        {/* Background pattern could be added here */}
      </div>
      <div className="absolute top-1/4 -right-20 w-64 h-64 bg-pink-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
      <div className="absolute bottom-1/4 -left-20 w-72 h-72 bg-indigo-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-block mb-6 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
          <span className="text-sm font-medium text-white/90">✨ Limited Time Offer</span>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
          Ready to Create Your Sweet Memories?
        </h2>
        
        <p className="text-xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
          Upload your photos and create stunning custom magnets in minutes. <br className="hidden lg:block" />
          Perfect for gifts, home decor, or keeping your favorite memories close.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/custom-order"
            className="group relative inline-flex items-center justify-center px-8 py-5 text-lg font-bold rounded-full text-indigo-700 bg-gradient-to-r from-yellow-300 to-amber-400 hover:from-yellow-200 hover:to-amber-300 transform transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl hover:shadow-yellow-500/30"
          >
            <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 rounded-full transition-opacity duration-300"></span>
            <span className="relative flex items-center">
              🎨 Start Designing Now
              <svg className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H4" />
              </svg>
            </span>
          </Link>
          
          <Link
            href="/products"
            className="group inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white/90 hover:text-white transition-colors duration-200"
          >
            Browse Collection
            <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        
        <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-white/80">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            No minimum order
          </div>
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Fast UK shipping
          </div>
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Satisfaction guaranteed
          </div>
        </div>
      </div>
    </section>
  );
}
