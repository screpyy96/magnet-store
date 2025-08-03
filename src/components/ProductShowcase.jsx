"use client";

import Image from 'next/image';
import Link from 'next/link';

const products = [
  {
    id: 1,
    name: '6 Custom Magnets',
    price: '£17.00',
    pricePerUnit: '£2.83 each',
    image: '/images/magnet1.jpeg',
    description: 'Ideal for small gifts or personal use',
    href: '/custom?package=6',
    tag: 'POPULAR',
    sampleImages: [
      '/images/magnet2.jpeg',
      '/images/magnet3.jpeg',
      '/images/magnet4.jpeg'
    ]
  },
  {
    id: 2,
    name: '9 Custom Magnets',
    price: '£23.00',
    pricePerUnit: '£2.55 each',
    image: '/images/magnet2.jpeg',
    description: 'Perfect for families and small collections',
    href: '/custom?package=9',
    tag: 'BEST VALUE',
    sampleImages: [
      '/images/magnet1.jpeg',
      '/images/magnet3.jpeg',
      '/images/magnet5.jpeg'
    ]
  },
  {
    id: 3,
    name: '12 Custom Magnets',
    price: '£28.00',
    pricePerUnit: '£2.33 each',
    image: '/images/magnet3.jpeg',
    description: 'Great for large families or multiple designs',
    href: '/custom?package=12',
    tag: 'BEST SELLER',
    sampleImages: [
      '/images/magnet2.jpeg',
      '/images/magnet4.jpeg',
      '/images/magnet6.jpeg'
    ]
  },
  {
    id: 4,
    name: '16 Custom Magnets',
    price: '£36.00',
    pricePerUnit: '£2.25 each',
    image: '/images/magnet4.jpeg',
    description: 'Ideal for businesses and bulk orders',
    href: '/custom?package=16',
    tag: 'BULK SAVER',
    sampleImages: [
      '/images/magnet1.jpeg',
      '/images/magnet5.jpeg',
      '/images/magnet7.jpeg'
    ]
  }
];

export default function ProductShowcase() {

  return (
    <section className="py-16 bg-gradient-to-b from-pink-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 mb-4 text-xs font-semibold tracking-wider text-pink-700 uppercase bg-pink-100 rounded-full">
            Made in the UK
          </span>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Personalised Magnet Collections</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Handcrafted in Britain, our custom magnets make perfect keepsakes and gifts. Choose your package and create something special today.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => {
            return (
              <div key={product.id} className="group relative bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="relative h-48 mb-4 rounded-lg overflow-hidden border border-gray-100">
                  <div className="relative h-64 w-full bg-white">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={300}
                      height={300}
                      className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                      style={{
                        backgroundColor: 'white',
                        maxWidth: '100%',
                        maxHeight: '100%',
                        margin: '0 auto',
                        display: 'block'
                      }}
                      priority
                      onError={(e) => {
                        console.error('Failed to load image:', product.image);
                        e.target.src = '/images/placeholder.jpg';
                      }}
                    />
                  </div>
                  {product.tag && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                      {product.tag}
                    </div>
                  )}

                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{product.name}</h3>
                  <p className="text-gray-600 mb-3 text-sm">{product.description}</p>
                  <div className="flex items-baseline justify-between mt-4">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">{product.price}</span>
                      <span className="block text-sm text-gray-500">Free UK Delivery</span>
                    </div>
                    <span className="text-sm text-gray-500">{product.pricePerUnit}</span>
                  </div>
                  <div className="space-y-3">
                    <Link
                      href={product.href}
                      className="block w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium py-2 px-4 rounded-full hover:opacity-90 transition-all hover:shadow-lg transform hover:-translate-y-0.5 text-center"
                    >
                      Create Yours Now
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-6">Need a custom order or bulk pricing? Contact us for special requests.</p>
          <a
            href="mailto:sales@magnetstore.com"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Contact for Bulk Orders
            <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
