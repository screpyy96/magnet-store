// @ts-check

const URL = 'https://mysweetmagnets.co.uk';

export default async function sitemap() {
  const routes = [
    '',
    '/products',
    '/custom',
    '/about',
    '/contact',
    '/privacy-policy',
    '/terms',
    '/shipping',
    '/returns',
    '/faq'
  ].map(route => ({
    url: `${URL}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));

  // Add dynamic product pages (example with mock data)
  // In a real app, you would fetch these from your database
  const products = [
    { slug: 'custom-fridge-magnets', lastModified: '2025-07-01' },
    { slug: 'photo-magnets', lastModified: '2025-07-01' },
    { slug: 'personalised-magnets', lastModified: '2025-07-01' },
  ];

  const productRoutes = products.map(product => ({
    url: `${URL}/products/${product.slug}`,
    lastModified: product.lastModified,
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  return [...routes, ...productRoutes];
}
