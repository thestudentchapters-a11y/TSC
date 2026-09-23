/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  eslint: { ignoreDuringBuilds: true },
  httpAgentOptions: {
    keepAlive: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
    remotePatterns: [
      // Allow admin-configured remote media (e.g. Cloudinary) once supplied.
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      // Allow YouTube video thumbnails automatically
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
};

export default nextConfig;
