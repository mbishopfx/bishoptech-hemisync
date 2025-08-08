/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['lamejs', 'wavefile']
  }
};

module.exports = nextConfig;

