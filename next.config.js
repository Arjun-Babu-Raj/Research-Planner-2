/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  distDir: '.next',
  output: 'standalone',
};

module.exports = nextConfig;
