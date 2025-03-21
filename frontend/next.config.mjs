/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  images: {
    domains: [
      'localhost', 
      'recipeshare-backend', 
      'i.imgur.com', 
      'images.unsplash.com', 
      '127.0.0.1',
      'bonytobeastly.com',
      'www.slenderkitchen.com',
      'images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com',
      'rainbowplantlife.com'
    ],
  }
};

export default nextConfig; 