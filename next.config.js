function normalizeOrigin(value) {
  if (!value) {
    return '';
  }

  return String(value).trim().replace(/\/+$/, '');
}

const backendOrigin = normalizeOrigin(process.env.BACKEND_ORIGIN);

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['lamejs', 'wavefile'],
  async rewrites() {
    if (!backendOrigin) {
      return [];
    }

    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: `${backendOrigin}/api/:path*`
        }
      ]
    };
  }
};

module.exports = nextConfig;
