import Link from "next/link";
import Image from "next/image";
import heroImg from "../../public/images/hero.webp";

export default function Hero() {
  return (
    <section className="relative h-auto min-h-[90vh] w-full overflow-hidden pt-20 pb-32 md:pt-0 md:pb-0 md:h-[90vh] md:min-h-[600px]">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src={heroImg}
          alt="Premium Custom Fridge Magnets"
          fill
          priority
          className="object-cover"
          sizes="100vw"
          placeholder="blur"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white sm:px-6 lg:px-8 py-16 md:py-0">
        <div className="max-w-4xl mx-auto">
          <div className="inline-block mb-4 md:mb-6 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
            <span className="text-sm font-semibold text-white drop-shadow-md [text-shadow:_0_1px_2px_rgba(0,0,0,0.8)]">
              🏴󠁧󠁢󠁥󠁮󠁧󠁿 Proudly Handcrafted in the UK
            </span>
          </div>
          
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl mb-4 sm:mb-6 leading-tight drop-shadow-lg [text-shadow:_0_2px_8px_rgba(0,0,0,0.5)]">
            Cherish Every Memory with My Sweet Magnets
          </h1>
          
          <p className="mx-auto mb-6 sm:mb-8 text-base sm:text-xl md:text-2xl max-w-2xl text-white leading-relaxed px-2 drop-shadow-lg [text-shadow:_0_2px_4px_rgba(0,0,0,0.7)] font-medium">
            Turn your favourite moments into beautiful, high-quality fridge magnets. Handmade in the UK with love.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-full text-white bg-gradient-to-r from-pink-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 transform transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl overflow-hidden"
            >
              <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative flex items-center">
                Shop Now
                <svg className="ml-2 -mr-1 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </Link>
            <Link
              href="/custom"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-full text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transform transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl overflow-hidden"
            >
              <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative flex items-center">
                Create Yours
                <svg className="ml-2 -mr-1 w-5 h-5 group-hover:rotate-45 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </span>
            </Link>
          </div>
          <p className="mt-4 text-sm font-medium text-white drop-shadow-md [text-shadow:_0_1px_2px_rgba(0,0,0,0.8)]">
            ⚡ <span className="font-semibold">UK Customers:</span> Free delivery on orders over £30!
          </p>
        </div>

        {/* Features Grid */}
        <div className="relative mt-12 sm:mt-16 md:absolute md:bottom-8 left-0 right-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
              {[
                { icon: '🚚', text: 'UK Next Day Delivery' },
                { icon: '🎨', text: 'Fully Customisable' },
                { icon: '✨', text: 'Premium British Quality' },
                { icon: '💝', text: 'Perfect Personalised Gifts' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-center gap-1 sm:gap-2 bg-white/10 backdrop-blur-sm px-2 sm:px-4 py-2 sm:py-3 rounded-lg border border-white/20">
                  <span className="text-base sm:text-xl">{item.icon}</span>
                  <span className="text-xs sm:text-sm font-semibold text-white drop-shadow-md [text-shadow:_0_1px_2px_rgba(0,0,0,0.8)]">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-40 h-40 bg-pink-400/20 rounded-full mix-blend-screen filter blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-60 h-60 bg-amber-400/20 rounded-full mix-blend-screen filter blur-3xl" />
      </div>
    </section>
  );
}