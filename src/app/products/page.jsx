import Link from 'next/link'
import Image from 'next/image'

export default function ProductsPage() {
  const products = [
    {
      id: 1,
      name: 'Custom Photo Magnets',
      description: 'Transform your favorite photos into beautiful magnets. Perfect for personalizing your space or giving as gifts.',
      image: 'https://images.unsplash.com/photo-1591129841117-3adfd313e34f',
      price: '9.99',
      link: '/custom'
    },
   
  ]

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Our Magnet Collection
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Discover our range of high-quality magnets for every occasion
          </p>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div key={product.id} className="group relative">
                <div className="aspect-w-4 aspect-h-3 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-center object-cover group-hover:opacity-75 transition-opacity"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="flex items-end p-4">
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-white bg-opacity-90 p-4 rounded-lg shadow-lg transform transition-transform group-hover:translate-y-0 translate-y-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {product.name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Starting at £{product.price}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <p className="text-sm text-gray-500">
                    {product.description}
                  </p>
                  <Link
                    href={product.link}
                    className="mt-4 block w-full bg-indigo-600 text-white text-center py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    {product.id === 1 ? 'Create Your Own' : 'View Details'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-24">
          <div className="bg-gray-50 rounded-2xl px-6 py-16 sm:p-16">
            <div className="max-w-xl mx-auto text-center">
              <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                Why Choose Our Magnets?
              </h2>
              <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-indigo-600 mb-4">
                    <svg className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Premium Quality</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Made with high-grade materials for durability and strong magnetic force
                  </p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-indigo-600 mb-4">
                    <svg className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Fast Production</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Quick turnaround time with same-day production for most orders
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/custom"
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            Start Creating Your Custom Magnet
            <svg className="ml-2 -mr-1 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
} 