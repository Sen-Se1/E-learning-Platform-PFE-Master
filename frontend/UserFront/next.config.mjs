/** @type {import('next').NextConfig} */

const getServiceUrl = (serviceName, defaultPort, envUrl) => {
  if (envUrl) {
    return envUrl.replace(/\/api\/v1\/?$/, '');
  }
  return process.env.NODE_ENV === 'production' 
    ? `http://${serviceName}:${defaultPort}` 
    : `http://localhost:${defaultPort}`;
};

const userURL = getServiceUrl('user-service', 8002, process.env.USER_SERVICE_URL);
const courseURL = getServiceUrl('course-service', 8003, process.env.COURSE_SERVICE_URL);
const progressURL = getServiceUrl('progress-service', 8004, process.env.PROGRESS_SERVICE_URL);
const inscriptionURL = getServiceUrl('inscription-service', 8005, process.env.INSCRIPTION_SERVICE_URL);

const nextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '' },
      { protocol: 'http', hostname: '127.0.0.1', port: '' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  async rewrites() {
    return [
      // User Service
      { source: '/api/v1/auth/:path*', destination: `${userURL}/api/v1/auth/:path*` },
      { source: '/api/v1/admin/:path*', destination: `${userURL}/api/v1/admin/:path*` },
      { source: '/api/v1/users/:path*', destination: `${userURL}/api/v1/users/:path*` },

      // Course Service
      { source: '/api/v1/courses/:path*', destination: `${courseURL}/api/v1/courses/:path*` },
      { source: '/api/v1/modules/:path*', destination: `${courseURL}/api/v1/modules/:path*` },
      { source: '/api/v1/lessons/:path*', destination: `${courseURL}/api/v1/lessons/:path*` },
      { source: '/api/v1/exercises/:path*', destination: `${courseURL}/api/v1/exercises/:path*` },
      { source: '/api/v1/reviews/:path*', destination: `${courseURL}/api/v1/reviews/:path*` },
      { source: '/uploads/:path*', destination: `${courseURL}/uploads/:path*` },

      // Progress Service
      { source: '/api/v1/submissions/:path*', destination: `${progressURL}/api/v1/submissions/:path*` },
      { source: '/api/v1/course-progress/:path*', destination: `${progressURL}/api/v1/course-progress/:path*` },
      { source: '/api/v1/activities/:path*', destination: `${progressURL}/api/v1/activities/:path*` },

      // Inscription Service
      { source: '/api/v1/inscriptions/:path*', destination: `${inscriptionURL}/api/v1/inscriptions/:path*` },
    ];
  },
};

export default nextConfig;
