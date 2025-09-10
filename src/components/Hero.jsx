
import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background: premium gradient + subtle grid */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(60rem_40rem_at_10%_-10%,#fde5f2,transparent),radial-gradient(60rem_40rem_at_110%_10%,#ede9fe,transparent)]" />
      <div
        className="absolute inset-0 -z-10 opacity-[.06]"
        style={{
          backgroundImage:
            "linear-gradient(0deg,transparent 24%,rgba(0,0,0,.5) 25%,rgba(0,0,0,.5) 26%,transparent 27%,transparent 74%,rgba(0,0,0,.5) 75%,rgba(0,0,0,.5) 76%,transparent 77%),linear-gradient(90deg,transparent 24%,rgba(0,0,0,.5) 25%,rgba(0,0,0,.5) 26%,transparent 27%,transparent 74%,rgba(0,0,0,.5) 75%,rgba(0,0,0,.5) 76%,transparent 77%)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 lg:pt-36 lg:pb-24">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Copy */}
          <div className="lg:col-span-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur border border-pink-200/60">
              <Image src="/logo-mark.svg" alt="Mark" width={20} height={20} />
              <span className="text-xs font-semibold text-pink-700">Handcrafted in the UK</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
              Premium Custom Photo Magnets
            </h1>
            <p className="mt-4 text-base sm:text-lg text-gray-700 max-w-xl mx-auto lg:mx-0">
              Transform your favourite moments into stunning fridge magnets. Premium print, strong hold, made with love in Britain.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link
                href="/custom"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-pink-500 to-purple-500 shadow-md hover:shadow-lg hover:opacity-95 transition"
              >
                Create Yours
                <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v12m6-6H6" />
                </svg>
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-pink-700 bg-white/80 border border-pink-200 hover:bg-white transition"
              >
                Shop Packs
                <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4-4 4M3 12h18" />
                </svg>
              </Link>
            </div>
            <div className="mt-4 flex items-center justify-center lg:justify-start gap-2 text-sm text-gray-600">
              <span className="flex items-center">
                <span className="text-yellow-400">★★★★★</span>
                <span className="ml-2">Rated 4.9/5 by 1,200+ customers</span>
              </span>
            </div>
          </div>

          {/* Visual / mockup */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto w-full max-w-xl">
              <div className="absolute -top-10 -left-10 h-32 w-32 rounded-full bg-pink-300/40 blur-2xl" />
              <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-purple-300/40 blur-2xl" />

              <div className="grid grid-cols-3 gap-3">
                {[
                  '/images/magnet1.jpeg',
                  '/images/magnet2.jpeg',
                  '/images/magnet3.jpeg',
                  '/images/magnet4.jpeg',
                  '/images/magnet5.jpeg',
                  '/images/magnet6.jpeg',
                ].map((src, i) => (
                  <div
                    key={i}
                    className={`relative aspect-square rounded-2xl overflow-hidden shadow-lg border border-white/70 bg-white ${
                      i % 3 === 0 ? 'rotate-[-3deg]' : 'rotate-[2deg]'
                    } hover:rotate-0 transition`}
                  >
                    <Image src={src} alt="Custom magnet" fill className="object-cover" sizes="(max-width:768px) 33vw, 200px" />
                  </div>
                ))}
              </div>

              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/90 backdrop-blur border border-pink-200 text-sm font-medium text-pink-700 shadow-sm">
                Free UK Delivery on all orders
              </div>
            </div>
          </div>
        </div>

        {/* Feature pills */}
        <div className="mt-10">
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { icon: '🚚', text: 'Next-Day Dispatch' },
              { icon: '🎨', text: 'Fully Customisable' },
              { icon: '✨', text: 'Premium Print' },
              { icon: '🧲', text: 'Strong Magnetic Hold' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/80 border border-pink-200 text-sm text-gray-700">
                <span>{item.icon}</span>
                <span className="font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
