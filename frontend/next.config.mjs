/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'images.unsplash.com',
      'placekitten.com',
      'via.placeholder.com',
      'bonytobeastly.com',
      'www.slenderkitchen.com',
      'images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com',
      'recipediumapi.vercel.app',
      'localhost'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      }
    ]
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/:path*` : 'http://localhost:5001/api/:path*'
      }
    ];
  }
}

export default nextConfig; 