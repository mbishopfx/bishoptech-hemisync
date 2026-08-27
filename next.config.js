function normalizeOrigin(value) {
  if (!value) {
    return '';
  }

  return String(value).trim().replace(/\/+$/, '');
}

const backendOrigin = normalizeOrigin(process.env.BACKEND_ORIGIN);
const FFMPEG_BINARY = './node_modules/ffmpeg-static/ffmpeg';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  outputFileTracingIncludes: {
    '/api/studio/renders/[renderId]/run': [FFMPEG_BINARY],
    '/api/audio/**': [FFMPEG_BINARY],
    '/api/admin/generate-library': [FFMPEG_BINARY],
    '/api/mcp': ['./skills/**/*']
  },
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
          source: '/api/:path((?!agent|admin|health|mcp|capabilities|member).*)',
          destination: `${backendOrigin}/api/:path*`
        }
      ]
    };
  }
};

module.exports = nextConfig;
