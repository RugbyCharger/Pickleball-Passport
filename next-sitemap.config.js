/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://pickleballpassport.com',
  generateRobotsTxt: true, // Generate robots.txt
  generateIndexSitemap: false, // Don't generate sitemap-0.xml index file for smaller sites
  exclude: [
    '/dashboard/*',
    '/admin/*',
    '/api/*',
    '/partner/dashboard/*',
    '/onboarding/*',
    '/sign-in/*',
    '/sign-up/*',
    '/booking/*',
    '/redirect',
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/admin',
          '/api',
          '/partner/dashboard',
          '/onboarding',
          '/sign-in',
          '/sign-up',
          '/booking',
          '/redirect',
        ],
      },
    ],
  },
  // Set priority and change frequency for different routes
  transform: async (config, path) => {
    // Default values
    let priority = 0.7;
    let changefreq = 'weekly';

    // Homepage gets highest priority
    if (path === '/') {
      priority = 1.0;
      changefreq = 'daily';
    }
    // Package pages are high priority
    else if (path.startsWith('/packages/')) {
      priority = 0.9;
      changefreq = 'weekly';
    }
    // Apply page is high priority
    else if (path === '/apply') {
      priority = 0.9;
      changefreq = 'monthly';
    }
    // Partners page
    else if (path === '/partners' || path === '/partner/signup') {
      priority = 0.8;
      changefreq = 'monthly';
    }
    // Trust & Safety page
    else if (path === '/trust-and-safety') {
      priority = 0.7;
      changefreq = 'monthly';
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    };
  },
};
