import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%234f46e5\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: '30px 30px'
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 md:py-24">
          <div className="grid md:grid-cols-2 gap-4 md:gap-8 items-center">
            {/* Text Content */}
            <div className="relative z-10 text-center md:text-left">
              <div className="inline-block mb-2 md:mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                  🎨 Design Your Own
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-3 md:mb-6 leading-tight">
                Transform Your Fridge with{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                  Custom Magnets
                </span>
              </h1>
              <p className="text-base md:text-xl text-gray-600 mb-4 md:mb-8 max-w-lg mx-auto md:mx-0">
                Create unique, personalized magnets that bring life to your space. Perfect for memories, decoration, or gifts.
              </p>
              <div className="flex flex-col gap-3 md:flex-row md:gap-4 md:justify-start justify-center">
                <Link
                  href="/custom"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Start Designing
                  <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  href="/gallery"
                  className="inline-flex items-center justify-center px-6 py-3 border-2 border-indigo-600 text-base font-medium rounded-full text-indigo-600 bg-white hover:bg-indigo-50 transform transition-all duration-200 hover:scale-105"
                >
                  View Gallery
                  <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Image Side */}
            <div className="relative z-10 hidden md:block">
              <div className="relative h-[500px] w-full">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-2xl transform rotate-6 scale-95 opacity-30"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl transform -rotate-2 scale-105 opacity-40"></div>
                <div className="relative h-full w-full rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1591129841117-3adfd313e34f"
                    alt="Decorative magnets on a fridge"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                </div>
                {/* Floating Elements */}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-yellow-200 rounded-full opacity-20 animate-float"></div>
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-purple-200 rounded-full opacity-20 animate-float-delay"></div>
              </div>
            </div>

            {/* Mobile Image */}
            <div className="relative z-10 md:hidden">
              <div className="relative h-[200px] w-full">
                <div className="relative h-full w-full rounded-2xl overflow-hidden shadow-lg">
                  <Image
                    src="https://images.unsplash.com/photo-1591129841117-3adfd313e34f"
                    alt="Decorative magnets on a fridge"
                    fill
                    className="object-cover"
                    sizes="100vw"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" fill="#F9FAFB"/>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 px-4 sm:px-6 lg:px-8 py-8 sm:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Why Choose MagnetCraft?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8">
            {/* Quality Feature */}
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="text-indigo-600 mb-4">
                <svg className="h-8 w-8 md:h-10 md:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">Premium Quality</h3>
              <p className="text-sm md:text-base text-gray-600">High-quality materials ensure your magnets last long and look great.</p>
            </div>

            {/* Custom Design Feature */}
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="text-indigo-600 mb-4">
                <svg className="h-8 w-8 md:h-10 md:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">Easy Customization</h3>
              <p className="text-sm md:text-base text-gray-600">Design your magnets exactly how you want them with our easy-to-use tools.</p>
            </div>

            {/* Fast Delivery Feature */}
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="text-indigo-600 mb-4">
                <svg className="h-8 w-8 md:h-10 md:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">Fast Delivery</h3>
              <p className="text-sm md:text-base text-gray-600">Quick production and shipping to get your magnets to you as soon as possible.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
