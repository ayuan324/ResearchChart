/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      { source: '/\u4e3b\u9875.html', destination: '/home' },
      { source: '/\u4e0a\u4f20\u9875.html', destination: '/upload2' },
      { source: '/\u5206\u6790\u9875.html', destination: '/analysis2' },
      { source: '/\u56fe\u8868\u7ed3\u679c\u9875.html', destination: '/result' },
    ]
  },
}

export default nextConfig
