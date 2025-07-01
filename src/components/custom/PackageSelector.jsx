import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const PACKAGES = [
  { 
    id: '6', 
    name: '6 Magnets', 
    price: 59.94, 
    pricePerUnit: 9.99, 
    description: 'Perfect for small spaces or trying out designs', 
    popular: false 
  },
  { 
    id: '12', 
    name: '12 Magnets', 
    price: 107.88, 
    pricePerUnit: 8.99, 
    description: 'Great value for more coverage', 
    popular: true 
  },
  { 
    id: '24', 
    name: '24 Magnets', 
    price: 191.76, 
    pricePerUnit: 7.99, 
    description: 'Best value for large projects', 
    popular: false 
  },
];

export default function PackageSelector({ onSelect }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    const packageId = searchParams.get('package');
    if (packageId) {
      setSelectedId(packageId);
      const pkg = PACKAGES.find(p => p.id === packageId);
      if (pkg) onSelect(pkg);
    }
  }, [searchParams, onSelect]);

  const handleSelect = (pkg) => {
    setSelectedId(pkg.id);
    // Update URL without page reload
    const url = new URL(window.location);
    url.searchParams.set('package', pkg.id);
    window.history.pushState({}, '', url);
    onSelect(pkg);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Choose Your Magnet Package
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Select the perfect package size for your custom magnets
          </p>
        </div>
        
        <div className="mt-12 grid gap-8 max-w-lg mx-auto lg:grid-cols-3 lg:max-w-none">
          {PACKAGES.map((pkg) => (
            <div 
              key={pkg.id}
              className={`flex flex-col rounded-2xl shadow-lg overflow-hidden transition-all duration-200 ${
                pkg.popular ? 'ring-2 ring-indigo-600 transform scale-105' : 'ring-1 ring-gray-200'
              } ${selectedId === pkg.id ? 'ring-2 ring-indigo-600' : ''}`}
            >
              {pkg.popular && (
                <div className="bg-indigo-600 py-2 px-4 text-center text-sm font-semibold text-white">
                  MOST POPULAR
                </div>
              )}
              <div className="px-6 py-8 bg-white sm:p-10 sm:pb-6">
                <div>
                  <h3 className="inline-flex px-4 py-1 rounded-full text-sm font-semibold tracking-wide uppercase bg-indigo-100 text-indigo-600">
                    {pkg.name}
                  </h3>
                </div>
                <div className="mt-4 flex items-baseline text-5xl font-extrabold text-gray-900">
                  ${pkg.price.toFixed(2)}
                  <span className="ml-1 text-2xl font-medium text-gray-500">
                    /{pkg.id}
                  </span>
                </div>
                <p className="mt-2 text-gray-500">
                  ${pkg.pricePerUnit.toFixed(2)} per magnet
                </p>
                <p className="mt-4 text-base text-gray-500">
                  {pkg.description}
                </p>
              </div>
              <div className="flex-1 flex flex-col justify-between px-6 pt-6 pb-8 bg-gray-50 space-y-6 sm:p-10 sm:pt-6">
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">
                      High-quality, durable magnets
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">
                      Full color printing
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">
                      Free shipping
                    </p>
                  </li>
                </ul>
                <div className="rounded-md shadow">
                  <button
                    onClick={() => handleSelect(pkg)}
                    className={`flex items-center justify-center px-5 py-3 border text-base font-medium rounded-md w-full ${
                      selectedId === pkg.id
                        ? 'bg-indigo-700 text-white border-transparent'
                        : 'bg-white text-indigo-600 border-gray-300 hover:bg-gray-50'
                    } md:py-4 md:text-lg md:px-10`}
                  >
                    {selectedId === pkg.id ? 'Selected' : `Choose ${pkg.name}`}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-base text-gray-500">
            Need a custom order or have questions?{' '}
            <a href="mailto:support@example.com" className="font-medium text-indigo-600 hover:text-indigo-500">
              Contact us
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
