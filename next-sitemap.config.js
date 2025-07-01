/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://mysweetmagnets.co.uk',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/account', '/checkout', '/cart', '/api'],
      },
    ],
    additionalSitemaps: [
      'https://mysweetmagnets.co.uk/sitemap.xml',
    ],
  },
  exclude: ['/server-sitemap.xml', '/admin/*', '/account/*'],
  generateIndexSitemap: true,
  outDir: 'public',
  // Adaugă prioritate și frecvență de actualizare pentru diferite rute
  changefreq: 'daily',
  priority: 0.7,
  // Configurare pentru paginile statice
  transform: async (config, path) => {
    // Setare prioritate și frecvență de actualizare în funcție de rută
    let priority = config.priority;
    let changefreq = config.changefreq;

    if (path === '/') {
      priority = 1.0;
      changefreq = 'daily';
    } else if (path.includes('/products/')) {
      priority = 0.9;
      changefreq = 'weekly';
    } else if (path === '/custom') {
      priority = 0.9;
      changefreq = 'weekly';
    } else if (path === '/about' || path === '/contact') {
      priority = 0.8;
      changefreq = 'monthly';
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: new Date().toISOString(),
    };
  },
  // Exclude fișierele din public care nu trebuie indexate
  exclude: [
    '/server-sitemap.xml',
    '/admin/*',
    '/account/*',
    '/checkout/*',
    '/api/*',
    '/404',
    '/500',
  ],
  // Adaugă suport pentru limbi străine (dacă este cazul)
  i18n: {
    defaultLocale: 'en-GB',
    locales: ['en-GB'],
  },
};
