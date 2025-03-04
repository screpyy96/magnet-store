import Image from "next/image";
import Link from "next/link";


export default function Home() {
  return (
    <div className="min-h-screen bg-white">
    

      {/* Hero Section */}
      <main className="pt-16">
        <div className="relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  Transform Your Fridge with Custom Magnets
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  Create unique, personalized magnets that bring life to your space. Perfect for memories, decoration, or gifts.
                </p>
                <div className="space-x-4">
                  <Link 
                    href="/custom" 
                    className="bg-indigo-600 text-white px-8 py-3 rounded-full hover:bg-indigo-700 transition inline-block"
                  >
                    Start Designing
                  </Link>
                  <Link
                    href="/gallery"
                    className="border border-indigo-600 text-indigo-600 px-8 py-3 rounded-full hover:bg-indigo-50 transition inline-block"
                  >
                    View Gallery
                  </Link>
                </div>
              </div>
              <div className="relative h-[400px]">
                <Image
                  src="https://images.unsplash.com/photo-1591129841117-3adfd313e34f?q=80&w=2000&auto=format&fit=crop"
                  alt="Decorative magnets on a fridge"
                  fill
                  className="object-cover rounded-lg shadow-xl"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Why Choose Our Magnets?</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Custom Designs</h3>
                <p className="text-gray-600">Upload your photos or create designs from scratch with our easy-to-use tools.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Premium Quality</h3>
                <p className="text-gray-600">Strong magnets with vibrant, long-lasting prints that won't fade over time.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Fast Shipping</h3>
                <p className="text-gray-600">Quick production and delivery to your doorstep with tracking included.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
