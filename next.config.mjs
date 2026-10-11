/** @type {import('next').NextConfig} */
const noindex = [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }]

const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  experimental: {
    // I font delle anteprime social sono letti dal disco: vanno inclusi nel pacchetto di deploy.
    outputFileTracingIncludes: {
      '/og': ['./assets/fonts/**'],
      '/blog/[slug]/og': ['./assets/fonts/**'],
    },
  },
  async headers() {
    // Pannello e API di amministrazione non devono mai finire negli indici, nemmeno se linkati altrove.
    return [
      { source: '/admin/:path*', headers: noindex },
      { source: '/api/:path*', headers: noindex },
    ]
  },
};

export default nextConfig;
