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
  turbopack: {
    root: __dirname,
  },
  serverExternalPackages: ['lamejs', 'wavefile'],
  async rewrites() {
    if (!backendOrigin) {
      return [];
    }

    return {
      fallback: [
        {
          source: '/api/:path((?!agent|admin|health).*)',
          destination: `${backendOrigin}/api/:path*`
        }
      ]
    };
  }
};

module.exports = nextConfig;
