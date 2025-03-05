import Link from 'next/link'
import Image from 'next/image'

export default function ProductsPage() {
  // Produse extinse cu mai multe opțiuni și categorii
  const products = [
    {
      id: 1,
      name: 'Custom Photo Magnets',
      description: 'Transform your favorite photos into beautiful magnets with our premium printing technology.',
      features: ['High-quality printing', 'Durable materials', 'Square shape (7x7cm)'],
      image: 'https://images.unsplash.com/photo-1591129841117-3adfd313e34f?w=800&q=80',
      price: '9.99',
      link: '/custom',
      category: 'custom',
      badge: 'Best Seller'
    },
    {
      id: 2,
      name: 'Family Pack (5 Magnets)',
      description: 'Create a collection of 5 custom magnets at a special discounted price.',
      features: ['Save 15%', 'Mix different photos', 'Perfect gift for family'],
      image: 'https://images.unsplash.com/photo-1596079890744-c1a0462d0975?w=800&q=80',
      price: '39.99',
      originalPrice: '49.95',
      link: '/custom',
      category: 'bundles',
      badge: 'Value Pack'
    },
    {
      id: 3,
      name: 'Heart-Shaped Magnets',
      description: 'Express your love with these beautiful heart-shaped custom photo magnets.',
      features: ['Romantic design', 'Perfect for couples', 'Unique gift idea'],
      image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&q=80',
      price: '12.99',
      link: '/custom',
      category: 'shapes',
      badge: 'New'
    },
    {
      id: 4,
      name: 'Mini Magnets Set (9 pcs)',
      description: 'Small but mighty! Create a set of 9 mini magnets from your favorite memories.',
      features: ['Compact size (3x3cm)', 'Great for small spaces', 'Instagram-style layout'],
      image: 'https://images.unsplash.com/photo-1596079890744-c1a0462d0975?w=800&q=80',
      price: '24.99',
      link: '/custom',
      category: 'bundles'
    },
  ]

  // Grupează produsele pe categorii
  const categories = {
    all: 'All Products',
    custom: 'Custom Magnets',
    bundles: 'Value Packs',
    shapes: 'Special Shapes'
  }

  // Testimoniale pentru social proof
  const testimonials = [
    {
      id: 1,
      name: 'Sarah M.',
      text: 'The magnets arrived quickly and look amazing! The quality is much better than I expected.',
      rating: 5
    },
    {
      id: 2,
      name: 'David L.',
      text: 'I ordered the family pack for Christmas gifts and everyone loved them. Will definitely order again!',
      rating: 5
    },
    {
      id: 3,
      name: 'Emma R.',
      text: 'The heart-shaped magnets were perfect for our wedding favors. Great quality and fast delivery.',
      rating: 5
    }
  ]

  return (
    <div className="bg-white">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: '30px 30px'
          }}></div>
        </div>
        <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              Premium Quality Magnets
            </h1>
            <p className="text-lg text-indigo-100 max-w-2xl mx-auto">
              Transform your photos into beautiful keepsakes that last a lifetime
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Link
                href="/custom"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-indigo-700 bg-white hover:bg-indigo-50 transition-colors"
              >
                Create Custom Magnet
              </Link>
              <a
                href="#products"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-indigo-800 bg-opacity-40 hover:bg-opacity-50 transition-colors"
              >
                Browse Collection
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8" id="products">
        {/* Category Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {Object.entries(categories).map(([key, label]) => (
            <button
              key={key}
              className="px-4 py-2 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
            >
              {label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
          {products.map((product) => (
            <div key={product.id} className="group relative bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="flex flex-col h-full">
                {/* Badge */}
                {product.badge && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {product.badge}
                    </span>
                  </div>
                )}
                
                {/* Image */}
                <div className="relative aspect-[4/3] bg-gray-100">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                
                {/* Content */}
                <div className="flex-1 p-6">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {product.name}
                    </h3>
                    <div className="flex items-baseline">
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through mr-2">£{product.originalPrice}</span>
                      )}
                      <span className="text-lg font-bold text-indigo-600">£{product.price}</span>
                    </div>
                  </div>
                  
                  <p className="mt-2 text-sm text-gray-500">
                    {product.description}
                  </p>
                  
                  {/* Features */}
                  <ul className="mt-4 space-y-1">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <svg className="h-4 w-4 text-indigo-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* CTA */}
                <div className="p-6 pt-0 mt-auto">
                  <Link
                    href={product.link}
                    className="block w-full text-center py-2.5 px-4 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:from-indigo-700 hover:to-purple-700 transition-colors"
                  >
                    Customize Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="mt-16 bg-indigo-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            What Our Customers Say
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white p-6 rounded-xl shadow-sm">
                {/* Stars */}
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg 
                      key={i} 
                      className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 italic mb-4">"{testimonial.text}"</p>
                <p className="text-sm font-medium text-gray-900">{testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-white p-6 rounded-xl border border-gray-100">
              <h3 className="text-lg font-medium text-gray-900 mb-2">How long do magnets take to arrive?</h3>
              <p className="text-gray-600">Orders are typically processed within 1-2 business days. Delivery times vary by location, but most UK orders arrive within 3-5 business days.</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-100">
              <h3 className="text-lg font-medium text-gray-900 mb-2">What photo quality do I need?</h3>
              <p className="text-gray-600">For best results, we recommend using high-resolution images (at least 1000x1000 pixels). Our system will let you know if your photo quality is too low.</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-100">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Can I order magnets in bulk?</h3>
              <p className="text-gray-600">Yes! We offer special pricing for bulk orders. Please contact our customer service team for custom quotes on orders of 20+ magnets.</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-100">
              <h3 className="text-lg font-medium text-gray-900 mb-2">What if I'm not happy with my order?</h3>
              <p className="text-gray-600">We offer a 100% satisfaction guarantee. If you're not completely satisfied, please contact us within 14 days of receiving your order for a replacement or refund.</p>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="mt-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to Create Your Custom Magnets?
          </h2>
          <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
            Turn your favorite photos into beautiful keepsakes in just a few clicks.
          </p>
          <Link
            href="/custom"
            className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-indigo-700 bg-white hover:bg-indigo-50 transition-colors"
          >
            Start Creating Now
            <svg className="ml-2 -mr-1 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
} 