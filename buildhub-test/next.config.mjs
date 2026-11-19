/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ფაილები პირდაპირ ობიექტურ საცავში იტვირთება; სერვერის სხეულის ლიმიტი მცირეა
  experimental: {
    serverActions: { bodySizeLimit: '2mb' },
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // HTTPS სავალდებულოა ყველა გვერდისთვის; HSTS ჩართულია (TD, თავი 11)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
        ],
      },
      {
        // webhook-ებს ქეში არ სჭირდება
        source: '/api/payments/webhook/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store, max-age=0' }],
      },
    ];
  },

  async rewrites() {
    const locale = ':locale(ka|en|ru|tr|az|hy|ar|fa)';
    const section = ':section(catalog|listings|login|register|dashboard|chat|admin)';
    return [
      { source: `/${locale}`, destination: '/' },
      { source: `/${locale}/${section}/:path*`, destination: '/:section/:path*' },
    ];
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: '*.r2.cloudflarestorage.com' },
    ],
  },
};

export default nextConfig;
