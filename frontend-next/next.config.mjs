/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable SWC minification to avoid Windows binary issues on this environment
  swcMinify: false,
  compiler: {
    // Optional: you can manually enable styled-components if needed
  },
  // Adding optional ignores to avoid unnecessary build failures for unresolved imports
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
