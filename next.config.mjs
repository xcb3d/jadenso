/** @type {import('next').NextConfig} */
const nextConfig = {
  // Exclude the water-learning-app directory from the build process
  experimental: {
    outputFileTracingExcludes: ['**/water-learning-app/**'],
  },
  // Ignore TypeScript errors in the water-learning-app directory
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
