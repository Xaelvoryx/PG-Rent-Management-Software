/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // NOTE: Use NEXT_EXPORT=true npm run build for Capacitor Android/iOS builds
  ...(process.env.NEXT_EXPORT === 'true'
    ? {
        output: 'export',
        images: { unoptimized: true },
      }
    : {}),
};

module.exports = nextConfig;
