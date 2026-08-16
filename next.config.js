/** Next.js config for Vercel */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // We're proxying images through API routes, so no external image domains required here.
  }
};

export default nextConfig;
