/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['lamejs', 'wavefile']
};

module.exports = nextConfig;
