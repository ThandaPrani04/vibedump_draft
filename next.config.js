/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    domains: ['heartitout.in'],
    unoptimized: true },
};

module.exports = nextConfig;
