/** @type {import('next').NextConfig} */
const noindex = [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }]
const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
  experimental: {
    outputFileTracingIncludes: {
      '/og': ['./assets/fonts/**'],
      '/blog/[slug]/og': ['./assets/fonts/**'],
    },
  },
  async headers() {
    return [
      { source: '/admin/:path*', headers: noindex },
      { source: '/stats/:path*', headers: noindex },
      { source: '/api/:path*', headers: noindex },
    ]
  },
}
export default nextConfig
